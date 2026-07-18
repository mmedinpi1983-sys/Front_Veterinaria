import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, MascotaSearchItem, MascotaDetalle, MascotaCreateRequest, MascotaUpdateRequest } from './pacientes.model';

const API = environment.apiUrl;

// Servicio de mascotas - gestiona el CRUD de pacientes veterinarios y la búsqueda en tiempo real
@Injectable({ providedIn: 'root' })
export class MascotaService {
  constructor(private http: HttpClient) {}

  // Lista todas las mascotas activas (sin datos del dueño)
  getMascotas(): Observable<ApiResponse<MascotaSearchItem[]>> {
    return this.http.get<ApiResponse<MascotaSearchItem[]>>(`${API}/api/mascota`);
  }

  // Búsqueda en tiempo real: retorna mascotas con nombre del dueño, especie y raza
  // Usado en el buscador de "Nueva Cita" y en el módulo de Pacientes
  buscar(q: string): Observable<ApiResponse<MascotaSearchItem[]>> {
    return this.http.get<ApiResponse<MascotaSearchItem[]>>(`${API}/api/mascota/buscar${q ? '?q=' + encodeURIComponent(q) : ''}`);
  }

  // Obtiene los datos completos de una mascota por ID (usado al editar)
  getMascota(id: number): Observable<ApiResponse<MascotaDetalle>> {
    return this.http.get<ApiResponse<MascotaDetalle>>(`${API}/api/mascota/${id}`);
  }

  // Registra una nueva mascota
  crearMascota(body: MascotaCreateRequest): Observable<ApiResponse<{ idMascota: number }>> {
    return this.http.post<ApiResponse<{ idMascota: number }>>(`${API}/api/mascota/crear`, body);
  }

  // Actualiza los datos de una mascota existente
  actualizarMascota(id: number, body: MascotaUpdateRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${API}/api/mascota/${id}`, body);
  }

  // Eliminación lógica de una mascota (soft delete)
  eliminarMascota(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/mascota/${id}`, { body: { idMascota: id } });
  }
}
