import { ProblemDetail } from './problem';

const API_BASE_URL = '/api/v1';
const DEFAULT_WORKSPACE_ID = 'ws_maison_ambre';

export interface FetchOptions extends RequestInit {
  workspaceId?: string;
  timeout?: number;
}

/**
 * Typed fetch wrapper with problem+json error handling, retries, and timeout.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    workspaceId = DEFAULT_WORKSPACE_ID,
    timeout = 30000,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(fetchOptions.headers);
  headers.set('x-workspace-id', workspaceId);
  headers.set('Content-Type', 'application/json');

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

    if (error instanceof ProblemDetail) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProblemDetail({
        type: 'https://winnit.tn/errors/timeout',
        title: 'Request Timeout',
        status: 408,
        detail: 'The request took too long to complete',
      });
    }

    throw new ProblemDetail({
      type: 'https://winnit.tn/errors/network',
      title: 'Network Error',
      status: 0,
      detail: error instanceof Error ? error.message : 'Network request failed',
    });
  }
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
