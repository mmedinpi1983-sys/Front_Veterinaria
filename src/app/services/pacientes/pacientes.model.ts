// Modelos del módulo de Pacientes (Mascota + Dueño, ver MascotaDTO, DuenoDTO y EspecieRaza en
// Backend_Veterinaria). El front manda "idAsociado"/"estado" en algunos create aunque el backend
// no los declare en el DTO (los ignora); se dejan opcionales aquí para reflejar lo que se envía.
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

// Resultado de la búsqueda en tiempo real (GET /api/mascota/buscar) - ya trae el dueño resuelto.
export interface MascotaSearchItem {
  idMascota: number;
  nombre: string;
  especie: string;
  raza: string;
  idDueno: number;
  nombreDueno: string;
  tamanio: string;
  sexo: string;
}

export interface MascotaDetalle {
  idMascota: number;
  nombre: string;
  idEspecie: number;
  idRaza: number;
  fechaNacimiento: string | null;
  sexo: string | null;
  tamanio: string | null;
  notas: string | null;
  estado: boolean;
  empleadoCreador?: string;
  fechaCreacion?: string;
  empleadoModificador?: string | null;
  fechaModificacion?: string | null;
}

export interface MascotaCreateRequest {
  nombre: string;
  idEspecie: number | null;
  idRaza: number | null;
  fechaNacimiento: string | null;
  sexo: string | null;
  tamanio: string | null;
  notas: string | null;
  idAsociado?: number;
  estado?: boolean;
}

// El PUT reenvía la mascota completa (spread de MascotaDetalle) con los campos a cambiar encima.
export type MascotaUpdateRequest = Partial<MascotaDetalle> & Record<string, unknown>;

export interface DuenoListItem {
  idDueno: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDocumento: string;
  estado: boolean;
  fechaCreacion: string;
}

export interface DuenoDetalle {
  idDueno: number;
  idDocumentoIdentidad: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDocumento: string;
  nroTelefono: string | null;
  correoElectronico: string | null;
  estado: boolean;
  empleadoCreador?: string;
  fechaCreacion?: string;
  empleadoModificador?: string | null;
  fechaModificacion?: string | null;
}

export interface DuenoCreateRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDocumento: string;
  nroTelefono: string | null;
  correoElectronico: string | null;
  idDocumentoIdentidad: number;
  idAsociado?: number;
  estado?: boolean;
}

// El PUT reenvía el dueño completo (spread de DuenoDetalle) con los campos a cambiar encima.
export type DuenoUpdateRequest = Partial<DuenoDetalle> & Record<string, unknown>;

// Catálogo de especies (tabla EspecieRaza autoreferida: registros raíz, idEspecie = null)
export interface EspecieCatalogo {
  idEspecieRaza: number;
  nombre: string;
}

// Catálogo de razas: cada una referencia a su especie por idEspecie
export interface RazaCatalogo {
  idEspecieRaza: number;
  nombre: string;
  idEspecie: number;
}
