// Envoltorio genérico de toda respuesta de la API (ver ApiResponse.java en el backend).
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
  errorCode?: string;
}
