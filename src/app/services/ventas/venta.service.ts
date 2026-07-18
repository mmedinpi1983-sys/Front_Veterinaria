import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, ProductoCatalogoVenta, MetodoPago, VentaListItem, VentaDetalle,
  VentaCreateRequest, VentaFiltros
} from './ventas.model';

const API = environment.apiUrl;

// Todo lo que el modulo de ventas le pide al backend.
@Injectable({ providedIn: 'root' })
export class VentaService {
  constructor(private http: HttpClient) {}

  // Catálogo de productos vendibles (con precio) para la grilla del POS
  getProductos(): Observable<ApiResponse<ProductoCatalogoVenta[]>> {
    return this.http.get<ApiResponse<ProductoCatalogoVenta[]>>(`${API}/api/venta/productos`);
  }

  // Métodos de pago activos (Efectivo, Tarjeta, Yape, etc.)
  getMetodosPago(): Observable<ApiResponse<MetodoPago[]>> {
    return this.http.get<ApiResponse<MetodoPago[]>>(`${API}/api/venta/metodospago`);
  }

  // Historial de ventas (enriquecido con cliente, método y total). Acepta filtros q y tipoComprobante
  getVentas(params: VentaFiltros = {}): Observable<ApiResponse<VentaListItem[]>> {
    const q = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get<ApiResponse<VentaListItem[]>>(`${API}/api/venta${q ? '?' + q : ''}`);
  }

  getVenta(id: number): Observable<ApiResponse<VentaDetalle>> {
    return this.http.get<ApiResponse<VentaDetalle>>(`${API}/api/venta/${id}`);
  }

  // Registra una venta con sus ítems (calcula subtotal/IGV/total en el backend)
  crearVenta(body: VentaCreateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/venta/crear`, body);
  }

  anularVenta(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/venta/${id}`);
  }
}
