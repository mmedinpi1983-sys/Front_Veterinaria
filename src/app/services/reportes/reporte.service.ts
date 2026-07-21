import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, ReporteData, DetalleReporteItem } from './reportes.model';

const API = environment.apiUrl;

// Llamadas para armar los reportes.
@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(private http: HttpClient) {}

  getReporte(): Observable<ApiResponse<ReporteData>> { return this.http.get<ApiResponse<ReporteData>>(`${API}/api/reporte`); }

  getDetalle(fechaInicio = '', fechaFin = ''): Observable<ApiResponse<DetalleReporteItem[]>> {
    const q = [
      fechaInicio ? `fechaInicio=${fechaInicio}` : '',
      fechaFin ? `fechaFin=${fechaFin}` : ''
    ].filter(Boolean).join('&');
    return this.http.get<ApiResponse<DetalleReporteItem[]>>(`${API}/api/reporte/detalle${q ? '?' + q : ''}`);
  }

  // Descarga el reporte en Excel. tipos: qué hojas incluir (resumen, ventas, citas, veterinarios).
  descargarExcel(tipos: string[], fechaInicio = '', fechaFin = ''): Observable<Blob> {
    const q = [
      `tipos=${tipos.join(',')}`,
      fechaInicio ? `fechaInicio=${fechaInicio}` : '',
      fechaFin ? `fechaFin=${fechaFin}` : ''
    ].filter(Boolean).join('&');
    return this.http.get(`${API}/api/reporte/excel?${q}`, { responseType: 'blob' });
  }
}
