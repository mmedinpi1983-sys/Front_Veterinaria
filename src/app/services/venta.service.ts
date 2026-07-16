import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Todo lo que el modulo de ventas le pide al backend.
@Injectable({ providedIn: 'root' })
export class VentaService {
  constructor(private http: HttpClient) {}

  // Catálogo de productos vendibles (con precio) para la grilla del POS
  getProductos(): Observable<any> {
    return this.http.get(`${API}/api/venta/productos`);
  }

  // Métodos de pago activos (Efectivo, Tarjeta, Yape, etc.)
  getMetodosPago(): Observable<any> {
    return this.http.get(`${API}/api/venta/metodospago`);
  }

  // Historial de ventas (enriquecido con cliente, método y total). Acepta filtros q y tipoComprobante
  getVentas(params: any = {}): Observable<any> {
    const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get(`${API}/api/venta${q ? '?' + q : ''}`);
  }

  getVenta(id: number): Observable<any> {
    return this.http.get(`${API}/api/venta/${id}`);
  }

  // Registra una venta con sus ítems (calcula subtotal/IGV/total en el backend)
  crearVenta(body: any): Observable<any> {
    return this.http.post(`${API}/api/venta/crear`, body);
  }

  anularVenta(id: number): Observable<any> {
    return this.http.delete(`${API}/api/venta/${id}`);
  }
}
