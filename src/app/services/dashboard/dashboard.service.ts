import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DashboardData, CitaEnriquecida } from './dashboard.model';

const API = environment.apiUrl;

// Llamadas del dashboard. Las citas del dia salen del mismo endpoint que usa Citas.
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  // Resumen + citas de la semana + alertas de stock (una sola llamada)
  getDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${API}/api/dashboard`);
  }

  // Citas de un día (reutiliza el endpoint enriquecido del módulo de citas)
  getCitasDia(fecha: string): Observable<ApiResponse<CitaEnriquecida[]>> {
    return this.http.get<ApiResponse<CitaEnriquecida[]>>(`${API}/api/citaprogramada/enriquecida?fechaInicio=${fecha}&fechaFin=${fecha}`);
  }
}
