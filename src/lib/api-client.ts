/**
 * Helper de cliente HTTP unificado para los formularios.
 *
 * - Lanza un Error con mensaje legible si la API responde con error.
 * - Devuelve `data` ya desempaquetado del envoltorio `{ data, ... }`.
 */

interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface ApiSuccessShape<T> {
  data: T;
  pagination?: unknown;
}

export class ApiClientError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as ApiSuccessShape<T> | ApiErrorShape;
  if (!res.ok) {
    const err = (json as ApiErrorShape).error;
    throw new ApiClientError(err?.code ?? "UNKNOWN", err?.message ?? "Error desconocido", err?.details);
  }
  return (json as ApiSuccessShape<T>).data;
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url, { method: "GET", cache: "no-store" }),
  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
