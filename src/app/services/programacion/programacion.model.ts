// Modelos del módulo de Programación de Veterinarios (ver ProgramacionDTO, TurnoDTO y
// EstadoProgramacionDTO en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

export interface ProgramacionListItem {
  idProgramacion: number;
  fecha: string;
  nombreVeterinario: string;
  nombreTurno: string;
  horaInicio: string;
  horaFin: string;
  nombreEstadoProgramacion: string;
  ambiente: string | null;
  descripcion: string | null;
  fechaCreacion: string;
}

export interface ProgramacionDetalle {
  idProgramacion: number;
  fecha: string;
  idTurno: number;
  idEmpleadoRegistrador: number;
  idEstadoProgramacion: number;
  idCategoria: number;
  idServicio: number;
  idConsultorio: number | null;
  ambiente: string | null;
  descripcion: string | null;
}

export interface ProgramacionCreateRequest {
  fecha: string;
  idTurno: number;
  idEmpleadoRegistrador: number;
  idEstadoProgramacion: number;
  idCategoria: number;
  idServicio: number;
  idConsultorio: number | null;
  ambiente?: string | null;
  descripcion: string | null;
}

export type ProgramacionUpdateRequest = ProgramacionCreateRequest;

export interface ProgramacionFiltros {
  fecha?: string;
  idEmpleadoRegistrador?: number;
  idEstadoProgramacion?: number;
  idTurno?: number;
}

export interface TurnoItem {
  idTurno: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  fechaCreacion: string;
  estado: boolean;
}

export interface TurnoCreateRequest {
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

export interface TurnoUpdateRequest extends TurnoCreateRequest {
  estado: boolean;
}

export interface TurnoFiltros {
  nombre?: string;
  estado?: boolean;
}

export interface ConsultorioItem {
  idConsultorio: number;
  nombre: string;
  descripcion: string | null;
  piso: string | null;
  estado: boolean;
  fechaCreacion: string;
}

export interface ConsultorioCreateRequest {
  nombre: string;
  descripcion: string | null;
  piso: string | null;
}

export interface ConsultorioUpdateRequest extends ConsultorioCreateRequest {
  estado: boolean;
}

export interface ConsultorioFiltros {
  nombre?: string;
  estado?: boolean;
}

export interface EstadoProgramacionCatalogo {
  idEstadoProgramacion: number;
  nombre: string;
}

export interface CategoriaCatalogo {
  idCategoria: number;
  nombreCategoria: string;
}

export interface ServicioCatalogo {
  idServicio: number;
  nombre: string;
}

export interface EmpleadoCatalogo {
  idEmpleadoAsociado: number;
  correo: string;
  nombreEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}
