import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, ProgramacionListItem, ProgramacionDetalle, ProgramacionCreateRequest, ProgramacionUpdateRequest,
  ProgramacionFiltros, TurnoItem, TurnoCreateRequest, TurnoUpdateRequest, TurnoFiltros,
  EstadoProgramacionCatalogo, CategoriaCatalogo, ServicioCatalogo, EmpleadoCatalogo
} from './programacion.model';

const API = environment.apiUrl;

// Servicio de Programación de Veterinarios: turnos de trabajo (Programacion) + catálogo de
// turnos (Turno) + catálogos de apoyo para armar el formulario (estado, categoría, servicio, empleado).
@Injectable({ providedIn: 'root' })
export class ProgramacionService {
  constructor(private http: HttpClient) {}

  // ---- Programación ----
  getProgramaciones(params: ProgramacionFiltros = {}): Observable<ApiResponse<ProgramacionListItem[]>> {
    const q = Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get<ApiResponse<ProgramacionListItem[]>>(`${API}/api/programacion${q ? '?' + q : ''}`);
  }
  getProgramacion(id: number): Observable<ApiResponse<ProgramacionDetalle>> {
    return this.http.get<ApiResponse<ProgramacionDetalle>>(`${API}/api/programacion/${id}`);
  }
  crearProgramacion(body: ProgramacionCreateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/programacion/crear`, body);
  }
  actualizarProgramacion(id: number, body: ProgramacionUpdateRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${API}/api/programacion/${id}`, body);
  }
  eliminarProgramacion(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/programacion/${id}`, { body: { idProgramacion: id } });
  }

  // ---- Turnos ----
  getTurnos(params: TurnoFiltros = {}): Observable<ApiResponse<TurnoItem[]>> {
    const q = Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get<ApiResponse<TurnoItem[]>>(`${API}/api/turno${q ? '?' + q : ''}`);
  }
  crearTurno(body: TurnoCreateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/turno/crear`, body);
  }
  actualizarTurno(id: number, body: TurnoUpdateRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${API}/api/turno/${id}`, body);
  }
  eliminarTurno(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/turno/${id}`, { body: { idTurno: id } });
  }

  // ---- Catálogos de apoyo para el formulario ----
  getEstadosProgramacion(): Observable<ApiResponse<EstadoProgramacionCatalogo[]>> {
    return this.http.get<ApiResponse<EstadoProgramacionCatalogo[]>>(`${API}/api/estadoprogramacion/catalogo`);
  }
  getCategorias(): Observable<ApiResponse<CategoriaCatalogo[]>> {
    return this.http.get<ApiResponse<CategoriaCatalogo[]>>(`${API}/api/categoria/catalogo`);
  }
  getServicios(): Observable<ApiResponse<ServicioCatalogo[]>> {
    return this.http.get<ApiResponse<ServicioCatalogo[]>>(`${API}/api/servicio/catalogo`);
  }
  getEmpleados(): Observable<ApiResponse<EmpleadoCatalogo[]>> {
    return this.http.get<ApiResponse<EmpleadoCatalogo[]>>(`${API}/api/empleadoasociado/catalogo`);
  }
}
