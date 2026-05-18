export interface FetcherErrorPayload {
  status: number;
  message: string;
  details?: any;
}

export class FetcherError extends Error {
  status: number;
  details?: any;

  constructor(payload: FetcherErrorPayload) {
    super(payload.message);
    this.name = "FetcherError";
    this.status = payload.status;
    this.details = payload.details;
  }
}

interface FetcherOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
  const { timeoutMs = 8000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetails: any = null;
      try {
        errorDetails = await response.json();
      } catch {
        // Fallback if response is not JSON
      }

      throw new FetcherError({
        status: response.status,
        message: errorDetails?.message || `Error del servidor (${response.statusText || response.status}).`,
        details: errorDetails?.details || errorDetails,
      });
    }

    // Handles empty body responses
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      throw new FetcherError({
        status: 408,
        message: "El servidor ha trigat massa a respondre. Si us plau, torna-ho a provar.",
      });
    }

    if (err instanceof FetcherError) {
      throw err;
    }

    throw new FetcherError({
      status: 500,
      message: err.message || "S'ha produït un error de connexió de xarxa.",
    });
  }
}
