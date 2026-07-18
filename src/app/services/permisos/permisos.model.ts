// Modelos de acceso por rol (ver PermisoAccessService en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

export interface AccesoRol {
  superAdmin: boolean;
  modulos: string[];
}
