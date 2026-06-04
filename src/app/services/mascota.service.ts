import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class MascotaService {
  constructor(private http: HttpClient) {}

  getMascotas(): Observable<any> {
    return this.http.get(`${API}/api/mascota`);
  }

  buscar(q: string): Observable<any> {
    return this.http.get(`${API}/api/mascota/buscar${q ? '?q=' + encodeURIComponent(q) : ''}`);
  }

  getMascota(id: number): Observable<any> {
    return this.http.get(`${API}/api/mascota/${id}`);
  }

  crearMascota(body: any): Observable<any> {
    return this.http.post(`${API}/api/mascota`, body);
  }

  actualizarMascota(id: number, body: any): Observable<any> {
    return this.http.put(`${API}/api/mascota/${id}`, body);
  }

  eliminarMascota(id: number): Observable<any> {
    return this.http.delete(`${API}/api/mascota/${id}`);
  }
}
