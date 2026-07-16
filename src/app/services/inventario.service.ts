import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Peticiones del inventario: productos y sus movimientos.
@Injectable({ providedIn: 'root' })
export class InventarioService {
  constructor(private http: HttpClient) {}

  // ---- Productos ----
  getProductos(params: any = {}): Observable<any> {
    const q = Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get(`${API}/api/producto${q ? '?' + q : ''}`);
  }
  getProductoStats(): Observable<any> { return this.http.get(`${API}/api/producto/stats`); }
  getCategorias(): Observable<any> { return this.http.get(`${API}/api/producto/categorias`); }
  getProducto(id: number): Observable<any> { return this.http.get(`${API}/api/producto/${id}`); }
  crearProducto(body: any): Observable<any> { return this.http.post(`${API}/api/producto/crear`, body); }
  actualizarProducto(id: number, body: any): Observable<any> { return this.http.put(`${API}/api/producto/${id}`, body); }
  eliminarProducto(id: number): Observable<any> { return this.http.delete(`${API}/api/producto/${id}`); }

  // ---- Movimientos ----
  getMovimientos(params: any = {}): Observable<any> {
    const q = Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return this.http.get(`${API}/api/movimientoproducto${q ? '?' + q : ''}`);
  }
  getMovimientoStats(): Observable<any> { return this.http.get(`${API}/api/movimientoproducto/stats`); }
  getClases(): Observable<any> { return this.http.get(`${API}/api/movimientoproducto/clases`); }
  getMotivos(): Observable<any> { return this.http.get(`${API}/api/movimientoproducto/motivos`); }
  getCatalogoProductos(): Observable<any> { return this.http.get(`${API}/api/producto/catalogo`); }
  crearMovimiento(body: any): Observable<any> { return this.http.post(`${API}/api/movimientoproducto/crear`, body); }
}
