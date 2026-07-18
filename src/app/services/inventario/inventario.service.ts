import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, ProductoListItem, ProductoDetalle, ProductoStats, CategoriaProducto, ProductoFiltros,
  ProductoCreateRequest, ProductoUpdateRequest, ProductoCatalogoItem,
  MovimientoListItem, MovimientoStats, ClaseMovimiento, MotivoMovimiento, MovimientoFiltros, MovimientoCreateRequest
} from './inventario.model';

const API = environment.apiUrl;

// Peticiones del inventario: productos y sus movimientos.
@Injectable({ providedIn: 'root' })
export class InventarioService {
  constructor(private http: HttpClient) {}

  // ---- Productos ----
  getProductos(params: ProductoFiltros = {}): Observable<ApiResponse<ProductoListItem[]>> {
    const q = Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get<ApiResponse<ProductoListItem[]>>(`${API}/api/producto${q ? '?' + q : ''}`);
  }
  getProductoStats(): Observable<ApiResponse<ProductoStats>> { return this.http.get<ApiResponse<ProductoStats>>(`${API}/api/producto/stats`); }
  getCategorias(): Observable<ApiResponse<CategoriaProducto[]>> { return this.http.get<ApiResponse<CategoriaProducto[]>>(`${API}/api/producto/categorias`); }
  getProducto(id: number): Observable<ApiResponse<ProductoDetalle>> { return this.http.get<ApiResponse<ProductoDetalle>>(`${API}/api/producto/${id}`); }
  crearProducto(body: ProductoCreateRequest): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/producto/crear`, body); }
  actualizarProducto(id: number, body: ProductoUpdateRequest): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/producto/${id}`, body); }
  eliminarProducto(id: number): Observable<ApiResponse<void>> { return this.http.delete<ApiResponse<void>>(`${API}/api/producto/${id}`); }

  // ---- Movimientos ----
  getMovimientos(params: MovimientoFiltros = {}): Observable<ApiResponse<MovimientoListItem[]>> {
    const q = Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get<ApiResponse<MovimientoListItem[]>>(`${API}/api/movimientoproducto${q ? '?' + q : ''}`);
  }
  getMovimientoStats(): Observable<ApiResponse<MovimientoStats>> { return this.http.get<ApiResponse<MovimientoStats>>(`${API}/api/movimientoproducto/stats`); }
  getClases(): Observable<ApiResponse<ClaseMovimiento[]>> { return this.http.get<ApiResponse<ClaseMovimiento[]>>(`${API}/api/movimientoproducto/clases`); }
  getMotivos(): Observable<ApiResponse<MotivoMovimiento[]>> { return this.http.get<ApiResponse<MotivoMovimiento[]>>(`${API}/api/movimientoproducto/motivos`); }
  getCatalogoProductos(): Observable<ApiResponse<ProductoCatalogoItem[]>> { return this.http.get<ApiResponse<ProductoCatalogoItem[]>>(`${API}/api/producto/catalogo`); }
  crearMovimiento(body: MovimientoCreateRequest): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/movimientoproducto/crear`, body); }
}
