import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Servicio de citas - centraliza todas las llamadas a la API relacionadas con citas y atención clínica
@Injectable({ providedIn: 'root' })
export class CitaService {
  constructor(private http: HttpClient) {}

  // Obtiene contadores del mes actual: total, pendientes, completadas, canceladas
  getStats(): Observable<any> {
    return this.http.get(`${API}/api/citaprogramada/stats`);
  }

  // Lista citas con datos completos (mascota, dueño, veterinario). Acepta filtros opcionales
  getCitasEnriquecidas(params: any = {}): Observable<any> {
    const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&');
    return this.http.get(`${API}/api/citaprogramada/enriquecida${q ? '?' + q : ''}`);
  }

  // Obtiene una cita por ID (usado para actualizar estado al cancelar/reprogramar)
  getCita(id: number): Observable<any> {
    return this.http.get(`${API}/api/citaprogramada/${id}`);
  }

  // Registra una nueva cita
  crearCita(body: any): Observable<any> {
    return this.http.post(`${API}/api/citaprogramada`, body);
  }

  // Actualiza una cita (cancelar = idEstadoCita:3, reprogramar = nueva fecha)
  actualizarCita(id: number, body: any): Observable<any> {
    return this.http.put(`${API}/api/citaprogramada/${id}`, body);
  }

  // Lista servicios veterinarios disponibles (vacunación, consulta, etc.)
  getServicios(): Observable<any> {
    return this.http.get(`${API}/api/servicio`);
  }

  // Verifica si ya existe una atención iniciada para una cita
  getAtencionPorCita(idCita: number): Observable<any> {
    return this.http.get(`${API}/api/atencion/por-cita/${idCita}`);
  }

  // --- Métodos del flujo de atención clínica ---

  // Registra el triaje (datos vitales: temperatura, peso, etc.)
  crearTriaje(body: any): Observable<any> {
    return this.http.post(`${API}/api/triaje`, body);
  }

  // Registra el detalle del triaje
  crearTriajeDetalle(body: any): Observable<any> {
    return this.http.post(`${API}/api/triajedetalle`, body);
  }

  // Crea el registro principal de la atención
  crearAtencion(body: any): Observable<any> {
    return this.http.post(`${API}/api/atencion`, body);
  }

  // Registra el diagnóstico y tratamiento de la consulta
  crearAtencionConsulta(body: any): Observable<any> {
    return this.http.post(`${API}/api/atencionconsulta`, body);
  }

  // Registra el historial médico del paciente
  crearAnamnesis(body: any): Observable<any> {
    return this.http.post(`${API}/api/anamnesis`, body);
  }

  // Crea la receta médica
  crearReceta(body: any): Observable<any> {
    return this.http.post(`${API}/api/receta`, body);
  }

  // Agrega un medicamento a la receta
  crearRecetaDetalle(body: any): Observable<any> {
    return this.http.post(`${API}/api/recetadetalle`, body);
  }

  // Lista medicamentos disponibles en el catálogo
  getMedicamentos(): Observable<any> {
    return this.http.get(`${API}/api/medicamentocatalogo`);
  }
}
