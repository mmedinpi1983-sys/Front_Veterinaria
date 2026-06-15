import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Servicio de mascotas - gestiona el CRUD de pacientes veterinarios y la búsqueda en tiempo real
@Injectable({ providedIn: 'root' })
export class MascotaService {
  constructor(private http: HttpClient) {}

  // Lista todas las mascotas activas (sin datos del dueño)
  getMascotas(): Observable<any> {
    return this.http.get(`${API}/api/mascota`);
  }

  // Búsqueda en tiempo real: retorna mascotas con nombre del dueño, especie y raza
  // Usado en el buscador de "Nueva Cita" y en el módulo de Pacientes
  buscar(q: string): Observable<any> {
    return this.http.get(`${API}/api/mascota/buscar${q ? '?q=' + encodeURIComponent(q) : ''}`);
  }

  // Obtiene los datos completos de una mascota por ID (usado al editar)
  getMascota(id: number): Observable<any> {
    return this.http.get(`${API}/api/mascota/${id}`);
  }

  // Registra una nueva mascota
  crearMascota(body: any): Observable<any> {
    return this.http.post(`${API}/api/mascota`, body);
  }

  // Actualiza los datos de una mascota existente
  actualizarMascota(id: number, body: any): Observable<any> {
    return this.http.put(`${API}/api/mascota/${id}`, body);
  }

  // Eliminación lógica de una mascota (soft delete)
  eliminarMascota(id: number): Observable<any> {
    return this.http.delete(`${API}/api/mascota/${id}`);
  }
}
