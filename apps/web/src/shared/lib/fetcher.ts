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

function extractMessage(data: any, status: number): string {
  if (!data) {
    return `Error del servidor (${status}).`;
  }

  if (data.message && data.message !== "Validation error.") {
    return data.message;
  }

  if (data.detail) {
    return typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
  }

  const details = data.details || data;
  if (typeof details === "object" && !Array.isArray(details)) {
    const fieldMessages: string[] = [];
    for (const [field, errors] of Object.entries(details)) {
      if (field === "detail" || field === "message" || field === "status_code") continue;
      if (Array.isArray(errors)) {
        fieldMessages.push(`${field}: ${errors.join(", ")}`);
      } else if (typeof errors === "string") {
        fieldMessages.push(`${field}: ${errors}`);
      }
    }
    if (fieldMessages.length > 0) {
      return fieldMessages.join("; ");
    }
  }

  if (data.message) {
    return data.message;
  }

  return `Error del servidor (${status}).`;
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
        message: extractMessage(errorDetails, response.status),
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
