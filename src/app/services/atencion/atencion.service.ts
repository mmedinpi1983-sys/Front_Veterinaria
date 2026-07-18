import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, CitaEnriquecida, CitaDetalle, CitaUpdateRequest, AtencionDetalle, MedicamentoResumen,
  TriajeCreateRequest, TriajeCreateResponse, TriajeDetalleCreateRequest,
  AtencionCreateRequest, AtencionCreateResponse,
  AtencionConsultaCreateRequest, AtencionConsultaCreateResponse,
  AnamnesisCreateRequest, RecetaCreateRequest, RecetaCreateResponse, RecetaDetalleCreateRequest
} from './atencion.model';

const API = environment.apiUrl;

// Servicio del flujo de Atención Clínica: triaje, anamnesis, consulta y receta de una cita.
@Injectable({ providedIn: 'root' })
export class AtencionService {
  constructor(private http: HttpClient) {}

  getCita(id: number): Observable<ApiResponse<CitaDetalle>> {
    return this.http.get<ApiResponse<CitaDetalle>>(`${API}/api/citaprogramada/${id}`);
  }

  getCitasEnriquecidas(): Observable<ApiResponse<CitaEnriquecida[]>> {
    return this.http.get<ApiResponse<CitaEnriquecida[]>>(`${API}/api/citaprogramada/enriquecida`);
  }

  actualizarCita(id: number, body: CitaUpdateRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${API}/api/citaprogramada/${id}`, body);
  }

  // Verifica si ya existe una atención iniciada para una cita
  getAtencionPorCita(idCita: number): Observable<ApiResponse<AtencionDetalle>> {
    return this.http.get<ApiResponse<AtencionDetalle>>(`${API}/api/atencion/por-cita/${idCita}`);
  }

  // Lista medicamentos disponibles en el catálogo (para armar la receta)
  getMedicamentos(): Observable<ApiResponse<MedicamentoResumen[]>> {
    return this.http.get<ApiResponse<MedicamentoResumen[]>>(`${API}/api/medicamentocatalogo`);
  }

  // Registra el triaje (datos vitales: temperatura, peso, etc.)
  crearTriaje(body: TriajeCreateRequest): Observable<ApiResponse<TriajeCreateResponse>> {
    return this.http.post<ApiResponse<TriajeCreateResponse>>(`${API}/api/triaje/crear`, body);
  }

  // Registra el detalle del triaje
  crearTriajeDetalle(body: TriajeDetalleCreateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/triajedetalle/crear`, body);
  }

  // Crea el registro principal de la atención
  crearAtencion(body: AtencionCreateRequest): Observable<ApiResponse<AtencionCreateResponse>> {
    return this.http.post<ApiResponse<AtencionCreateResponse>>(`${API}/api/atencion/crear`, body);
  }

  // Registra el diagnóstico y tratamiento de la consulta
  crearAtencionConsulta(body: AtencionConsultaCreateRequest): Observable<ApiResponse<AtencionConsultaCreateResponse>> {
    return this.http.post<ApiResponse<AtencionConsultaCreateResponse>>(`${API}/api/atencionconsulta/crear`, body);
  }

  // Registra el historial médico del paciente
  crearAnamnesis(body: AnamnesisCreateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/anamnesis/crear`, body);
  }

  // Crea la receta médica
  crearReceta(body: RecetaCreateRequest): Observable<ApiResponse<RecetaCreateResponse>> {
    return this.http.post<ApiResponse<RecetaCreateResponse>>(`${API}/api/receta/crear`, body);
  }

  // Agrega un medicamento a la receta
  crearRecetaDetalle(body: RecetaDetalleCreateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/recetadetalle/crear`, body);
  }
}
