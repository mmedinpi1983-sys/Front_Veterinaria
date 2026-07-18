import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, CitaEnriquecida, CitaDetalle, CitaStats, VeterinarioDisponible,
  ServicioCita, CitaFiltros, CitaCreateRequest, CitaUpdateRequest
} from './citas.model';

const API = environment.apiUrl;

// Servicio de citas - centraliza todas las llamadas a la API relacionadas con citas
@Injectable({ providedIn: 'root' })
export class CitaService {
  constructor(private http: HttpClient) {}

  // Obtiene contadores del mes actual: total, pendientes, completadas, canceladas
  getStats(): Observable<ApiResponse<CitaStats>> {
    return this.http.get<ApiResponse<CitaStats>>(`${API}/api/citaprogramada/stats`);
  }

  // Lista citas con datos completos (mascota, dueño, veterinario). Acepta filtros opcionales
  getCitasEnriquecidas(params: CitaFiltros = {}): Observable<ApiResponse<CitaEnriquecida[]>> {
    const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&');
    return this.http.get<ApiResponse<CitaEnriquecida[]>>(`${API}/api/citaprogramada/enriquecida${q ? '?' + q : ''}`);
  }

  // Obtiene una cita por ID (usado para actualizar estado al cancelar/reprogramar)
  getCita(id: number): Observable<ApiResponse<CitaDetalle>> {
    return this.http.get<ApiResponse<CitaDetalle>>(`${API}/api/citaprogramada/${id}`);
  }

  // Registra una nueva cita
  crearCita(body: CitaCreateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/citaprogramada/crear`, body);
  }

  // Actualiza una cita (cancelar = idEstadoCita:3, reprogramar = nueva fecha)
  actualizarCita(id: number, body: CitaUpdateRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${API}/api/citaprogramada/${id}`, body);
  }

  // Lista servicios veterinarios disponibles (vacunación, consulta, etc.)
  getServicios(): Observable<ApiResponse<ServicioCita[]>> {
    return this.http.get<ApiResponse<ServicioCita[]>>(`${API}/api/servicio`);
  }

  // Lista veterinarios disponibles con su turno (para el select del modal de Nueva Cita)
  getVeterinarios(): Observable<ApiResponse<VeterinarioDisponible[]>> {
    return this.http.get<ApiResponse<VeterinarioDisponible[]>>(`${API}/api/citaprogramada/veterinarios`);
  }

  // Horas (HH:mm) ya ocupadas por ese veterinario (programación) en una fecha.
  // excluir: id de cita a ignorar (al reprogramar, para no contar su propio horario).
  getHorasOcupadas(idProgramacion: number, fecha: string, excluir?: number): Observable<ApiResponse<string[]>> {
    const ex = excluir ? `&excluir=${excluir}` : '';
    return this.http.get<ApiResponse<string[]>>(`${API}/api/citaprogramada/horas-ocupadas?idProgramacion=${idProgramacion}&fecha=${fecha}${ex}`);
  }
}
