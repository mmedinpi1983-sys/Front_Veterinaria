// Modelos del módulo de Citas (ver CitaProgramadaDTO y ServicioDTO en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

// Fila de la tabla de citas (GET /enriquecida) - ya viene con nombres resueltos, no ids sueltos.
export interface CitaEnriquecida {
  idCitaProgramada: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreMascota: string;
  especie: string;
  raza: string;
  nombreDueno: string;
  nombreServicio: string;
  nombreVeterinario: string;
  estadoCita: string;
  idEstadoCita: number;
  motivo: string;
}

// Detalle "en crudo" de una cita (GET /:id) - se usa como base para cancelar/reprogramar.
export interface CitaDetalle {
  idCitaProgramada: number;
  idDueno: number;
  idProgramacion: number;
  idMascota: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  idEstadoCita: number;
  motivo: string;
  idCategoria: number;
  idServicio: number;
  motivoReprogramacion: string | null;
  usuarioCreador?: string;
  fechaCreacion?: string;
  usuarioModificador?: string | null;
  fechaModificacion?: string | null;
  usuarioEliminador?: string | null;
  fechaEliminacion?: string | null;
}

export interface CitaStats {
  total: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
}

export interface VeterinarioDisponible {
  idProgramacion: number;
  nombreVeterinario: string;
  nombreTurno: string;
  horaInicio: string;
  horaFin: string;
}

export interface ServicioCita {
  idServicio: number;
  nombre: string;
  estado?: boolean;
  fechaCreacion?: string;
}

export interface CitaFiltros {
  busqueda?: string;
  idEstado?: string | number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface CitaCreateRequest {
  idDueno: number;
  idProgramacion: number;
  idMascota: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  idEstadoCita: number;
  motivo: string;
  idCategoria: number;
  idServicio: number;
}

// El PUT siempre reenvía la cita completa (spread de CitaDetalle) con los campos a cambiar
// encima (cancelar, reprogramar), así que se acepta parcial en vez del shape exacto del backend.
export type CitaUpdateRequest = Partial<CitaDetalle> & Record<string, unknown>;
