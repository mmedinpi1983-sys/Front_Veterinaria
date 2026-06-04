import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<any> { return this.http.get(`${API}/api/citaprogramada/stats`); }
  getCitasEnriquecidas(params: any = {}): Observable<any> {
    const q = Object.entries(params).filter(([,v]) => v).map(([k,v]) => `${k}=${v}`).join('&');
    return this.http.get(`${API}/api/citaprogramada/enriquecida${q ? '?'+q : ''}`);
  }
  getCita(id: number): Observable<any> { return this.http.get(`${API}/api/citaprogramada/${id}`); }
  crearCita(body: any): Observable<any> { return this.http.post(`${API}/api/citaprogramada`, body); }
  actualizarCita(id: number, body: any): Observable<any> { return this.http.put(`${API}/api/citaprogramada/${id}`, body); }
  getMascotas(): Observable<any> { return this.http.get(`${API}/api/mascota`); }
  getServicios(): Observable<any> { return this.http.get(`${API}/api/servicio`); }
  getAtencionPorCita(idCita: number): Observable<any> { return this.http.get(`${API}/api/atencion/por-cita/${idCita}`); }
  crearTriaje(body: any): Observable<any> { return this.http.post(`${API}/api/triaje`, body); }
  crearTriajeDetalle(body: any): Observable<any> { return this.http.post(`${API}/api/triajedetalle`, body); }
  crearAtencion(body: any): Observable<any> { return this.http.post(`${API}/api/atencion`, body); }
  crearAtencionConsulta(body: any): Observable<any> { return this.http.post(`${API}/api/atencionconsulta`, body); }
  crearAnamnesis(body: any): Observable<any> { return this.http.post(`${API}/api/anamnesis`, body); }
  crearReceta(body: any): Observable<any> { return this.http.post(`${API}/api/receta`, body); }
  crearRecetaDetalle(body: any): Observable<any> { return this.http.post(`${API}/api/recetadetalle`, body); }
  getMedicamentos(): Observable<any> { return this.http.get(`${API}/api/medicamentocatalogo`); }
}
