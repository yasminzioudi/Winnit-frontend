/**
 * RFC 7807 Problem Details for HTTP APIs
 */
export class ProblemDetail extends Error {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  requestId?: string;
  errors?: Record<string, string[]>;

  constructor(problem: {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    requestId?: string;
    errors?: Record<string, string[]>;
  }) {
    super(problem.detail);
    this.name = 'ProblemDetail';
    this.type = problem.type;
    this.title = problem.title;
    this.status = problem.status;
    this.detail = problem.detail;
    this.instance = problem.instance;
    this.requestId = problem.requestId;
    this.errors = problem.errors;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProblemDetail);
    }
  }

  /**
   * Convert to human-friendly French message
   */
  toFrenchMessage(): string {
    // Common error mappings
    const errorMessages: Record<number, string> = {
      400: 'Requête invalide',
      401: 'Non autorisé',
      403: 'Accès refusé',
      404: 'Ressource introuvable',
      409: 'Conflit - cette ressource a été modifiée',
      422: 'Impossible de traiter cette requête',
      429: 'Trop de requêtes - veuillez patienter',
      500: 'Erreur serveur',
      502: 'Service temporairement indisponible',
      503: 'Service en maintenance',
    };

    // Validation errors
    if (this.status === 400 && this.errors) {
      const fieldErrors = Object.entries(this.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      return `Erreur de validation: ${fieldErrors}`;
    }

    // Network/timeout errors
    if (this.status === 0 || this.status === 408) {
      return 'Erreur réseau - vérifiez votre connexion';
    }

    // Use mapped message or fall back to detail
    return errorMessages[this.status] || this.detail || 'Une erreur est survenue';
  }
}
