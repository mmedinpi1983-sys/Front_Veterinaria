import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Llamadas para armar los reportes.
@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(private http: HttpClient) {}

  getReporte(): Observable<any> { return this.http.get(`${API}/api/reporte`); }

  getDetalle(fechaInicio = '', fechaFin = ''): Observable<any> {
    const q = [
      fechaInicio ? `fechaInicio=${fechaInicio}` : '',
      fechaFin ? `fechaFin=${fechaFin}` : ''
    ].filter(Boolean).join('&');
    return this.http.get(`${API}/api/reporte/detalle${q ? '?' + q : ''}`);
  }
}
