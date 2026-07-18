// Modelos del flujo de Atención Clínica (Triaje -> Anamnesis -> Consulta -> Receta).
// Ver AtencionDTO, TriajeDTO, TriajeDetalleDTO, AtencionConsultaDTO, AnamnesisDTO, RecetaDTO
// y RecetaDetalleDTO en Backend_Veterinaria. Reutiliza CitaEnriquecida/CitaDetalle de Citas
// porque la atención se abre siempre desde una cita ya cargada.
import { ApiResponse } from '../shared/api-response.model';
import { CitaEnriquecida, CitaDetalle, CitaUpdateRequest } from '../citas/citas.model';
export type { ApiResponse, CitaEnriquecida, CitaDetalle, CitaUpdateRequest };

export interface AtencionDetalle {
  idAtencion: number;
  idCitaProgramada: number;
  idTriaje: number;
  fechaAtencion: string;
  horaInicio: string;
  horaFin: string | null;
  observacion: string;
  idEstadoSalida: number;
  idEstadoAtencion: number;
  idMascota: number;
}

export interface MedicamentoResumen {
  idMedicamento: number;
  codigoMedicamento: string;
  nombreMedicamento: string;
  descripcion: string;
}

export interface TriajeCreateRequest {
  idCitaProgramada: number;
  codigoTemporal: string;
  idMascota: number;
  prioridad: number;
  idMetodoIngreso: number;
  idAsociado?: number;
  estado?: boolean;
}

export interface TriajeCreateResponse { idTriaje: number; }

export interface TriajeDetalleCreateRequest {
  idTriaje: number;
  temperatura: number | null;
  peso: number | null;
  alergias: string | null;
  observaciones: string | null;
}

export interface AtencionCreateRequest {
  idCitaProgramada: number;
  idTriaje: number;
  fechaAtencion: string;
  horaInicio: string;
  horaFin?: string;
  observacion: string;
  idEstadoSalida: number;
  idEstadoAtencion: number;
  idMascota: number;
  idAsociado?: number;
}

export interface AtencionCreateResponse { idAtencion: number; }

export interface AtencionConsultaCreateRequest {
  idAtencion: number;
  motivoConsulta: string;
  evaluacionClinica: string;
  tratamiento: string;
  indicaciones: string;
  observaciones: string;
  requiereControl: boolean;
  fechaProximoControl: string | null;
}

export interface AtencionConsultaCreateResponse { idConsulta: number; }

export interface AnamnesisCreateRequest {
  idConsulta: number;
  antecedentes: string;
  alergias: number;
  cirugiasAnteriores: number;
  medicamentosActuales: string;
  historialVacunacion: string | null;
  alimentacion: string | null;
  comportamiento: string | null;
  historialReproductivo: number;
  inicioSintomas: string;
  evolucionSintomas: string;
  observaciones: string | null;
}

export interface RecetaCreateRequest {
  idConsulta: number;
  fechaReceta: string;
  idEmpleadoAsociado: number;
  idAsociado?: number;
}

export interface RecetaCreateResponse { idReceta: number; }

export interface RecetaDetalleCreateRequest {
  idReceta: number;
  idMedicamento: number;
  dosis: string;
  frecuencia: string;
  duracion: string;
  viaAdministracion: number;
  indicacionesEspecificas: string;
}
