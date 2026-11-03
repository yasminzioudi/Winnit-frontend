import { ProblemDetail } from './problem';

const API_BASE_URL = '/api/v1';
const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_WORKSPACE_ID || 'ws_maison_ambre';

export interface FetchOptions extends RequestInit {
  workspaceId?: string;
  timeout?: number;
  retries?: number;
}

/**
 * Typed fetch wrapper with problem+json error handling, exponential backoff retries on GET, and timeout.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    workspaceId = DEFAULT_WORKSPACE_ID,
    timeout = 10000,
    retries = options.method === 'GET' || !options.method ? 2 : 0,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(fetchOptions.headers);
  headers.set('x-workspace-id', workspaceId);
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Idempotency-Key for mutating requests
  const method = (fetchOptions.method || 'GET').toUpperCase();
  if (['POST', 'PATCH', 'DELETE'].includes(method) && !headers.has('Idempotency-Key')) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      headers.set('Idempotency-Key', crypto.randomUUID());
    } else {
      headers.set('Idempotency-Key', `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    }
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await handleErrorResponse(response);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      // Do NOT retry 4xx errors
      if (error instanceof ProblemDetail && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Only retry GET or safe requests on 5xx/network errors
      if (method === 'GET' && attempt < retries) {
        attempt++;
        const backoffMs = Math.min(1000, 300 * Math.pow(2, attempt - 1));
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }

      break;
    }
  }

  if (lastError instanceof ProblemDetail) {
    throw lastError;
  }

  if (lastError instanceof Error && lastError.name === 'AbortError') {
    throw new ProblemDetail({
      type: 'https://winnit.tn/errors/timeout',
      title: 'Request Timeout',
      status: 408,
      detail: 'La requête a pris trop de temps à répondre (délai dépassé)',
    });
  }

  throw new ProblemDetail({
    type: 'https://winnit.tn/errors/network',
    title: 'Network Error',
    status: 0,
    detail: lastError instanceof Error ? lastError.message : 'Échec de connexion au serveur',
  });
}

async function handleErrorResponse(response: Response): Promise<never> {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/problem+json')) {
    const problem = await response.json();
    throw new ProblemDetail(problem);
  }

  // Fallback for non-problem+json errors
  let detail = response.statusText;
  try {
    const body = await response.json();
    detail = body.message || body.error || detail;
  } catch {
    // Body is not JSON, use statusText
  }

  throw new ProblemDetail({
    type: `https://winnit.tn/errors/${response.status}`,
    title: response.statusText,
    status: response.status,
    detail,
  });
}

/**
 * Helper for GET requests
 */
export function apiGet<T>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * Helper for POST requests
 */
export function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Helper for PATCH requests
 */
export function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * Helper for DELETE requests
 */
export function apiDelete<T>(
  endpoint: string,
  options?: FetchOptions,
): Promise<T> {
  return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
}
