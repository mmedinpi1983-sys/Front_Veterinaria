// Modelos de autenticación (ver AuthDTO en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

// Respuesta del login - se guarda tal cual en localStorage como la "sesión" del usuario.
export interface Sesion {
  idEmpleadoAsociado: number;
  nombreEmpleado: string;
  apellidoPaterno: string;
  correo: string;
  idRolesClinica: number;
  idAsociado: number;
  token: string;
}
