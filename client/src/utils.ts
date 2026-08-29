const API_URL = import.meta.env.VITE_API_URL || "";

export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data: T;
}

function apiRequest<T = undefined>(url: string, options: RequestInit = {}): Promise<ApiResponse<T> | null> {
  return fetch(`${API_URL}${url}`, {
    credentials: "include",
    headers: { "Content-type": "application/json", ...options.headers },
    ...options,
  }).then((res) => {
    if (res.status === 401 || res.status === 204) return null;
    return res.json() as Promise<ApiResponse<T>>;
  });
}

export default apiRequest;