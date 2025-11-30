import type { UseFetchOptions } from "nuxt/app";
import type { Catalog, CatalogMetadata } from "~/types/catalogue";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public statusText?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "Request timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Standardized API client wrapper around $fetch
 * Provides consistent error handling and type safety
 *
 * Extensible for future features:
 * - Auth: Request interceptor adds auth tokens
 * - Cart/Checkout: Same error handling, different endpoints
 */
export async function apiClient<T>(
  url: string,
  options: UseFetchOptions<T> = {}
): Promise<T> {
  const config = useRuntimeConfig();
  const baseURL =
    config.public.apiBaseUrl || "https://catalogue-service.fly.dev";

  const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

  // Request interceptor: Add auth token if available (future: authStore)
  // Safe access to authStore if it exists (optional for future)
  let headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Try to get authStore if it exists (future-proof)
  try {
    // @ts-ignore - authStore may not exist yet
    const authStore = typeof useAuthStore === "function" ? useAuthStore() : null;
    if (authStore?.isAuthenticated && authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }
  } catch {
    // authStore doesn't exist yet, continue without auth
  }

  try {
    const response = await $fetch<T>(fullUrl, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      // Default timeout: 10 seconds
      timeout: options.timeout || 10000,
      // Retry configuration
      retry: options.retry ?? 2,
      retryDelay: options.retryDelay ?? 1000,
      // Error handling
      onRequestError({ error }) {
        throw new NetworkError(
          `Network request failed: ${error.message}`,
          error
        );
      },
      onResponseError({ response }) {
        const statusCode = response.status;
        const statusText = response.statusText;
        const data = response._data;

        // Handle 401 Unauthorized - trigger auth refresh/logout (future)
        if (statusCode === 401) {
          try {
            // @ts-ignore - authStore may not exist yet
            const authStore =
              typeof useAuthStore === "function" ? useAuthStore() : null;
            if (authStore?.handleUnauthorized) {
              authStore.handleUnauthorized();
            }
          } catch {
            // authStore doesn't exist yet, continue
          }
        }

        // Standardized error messages based on status code
        let message = "An error occurred";

        if (statusCode >= 400 && statusCode < 500) {
          message = `Client error: ${statusText || "Bad Request"}`;
        } else if (statusCode >= 500) {
          message = `Server error: ${statusText || "Internal Server Error"}`;
        }

        throw new ApiError(message, statusCode, statusText, data);
      },
    });

    return response;
  } catch (error) {
    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError("Request timed out");
    }

    // Re-throw known errors
    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }

    // Wrap unknown errors
    throw new NetworkError(
      `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error
    );
  }
}

/**
 * Error type checking utilities
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Helper to get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    // Provide specific messages based on status code
    if (error.statusCode === 404) {
      return "Catalog not found";
    }
    if (error.statusCode === 500) {
      return "Server error. Please try again later.";
    }
    return error.message;
  }

  if (isNetworkError(error)) {
    return "Network error. Please check your connection.";
  }

  if (isTimeoutError(error)) {
    return "Request timed out. Please try again.";
  }

  return "An unexpected error occurred";
}

/**
 * Type-safe API client methods for specific endpoints
 * Pattern: Separate API modules for different domains
 */
export const catalogApi = {
  /**
   * Fetch a single catalog by identifier
   */
  async getCatalog(identifier: string): Promise<Catalog> {
    return apiClient<Catalog>(`/catalogs/${identifier}`);
  },

  /**
   * Fetch list of catalogs (metadata only)
   */
  async getCatalogList(): Promise<CatalogMetadata[]> {
    return apiClient<CatalogMetadata[]>("/catalogs");
  },
};
