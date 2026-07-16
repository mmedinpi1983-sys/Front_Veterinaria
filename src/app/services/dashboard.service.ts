import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Llamadas del dashboard. Las citas del dia salen del mismo endpoint que usa Citas.
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  // Resumen + citas de la semana + alertas de stock (una sola llamada)
  getDashboard(): Observable<any> {
    return this.http.get(`${API}/api/dashboard`);
  }

  // Citas de un día (reutiliza el endpoint enriquecido del módulo de citas)
  getCitasDia(fecha: string): Observable<any> {
    return this.http.get(`${API}/api/citaprogramada/enriquecida?fechaInicio=${fecha}&fechaFin=${fecha}`);
  }
}
