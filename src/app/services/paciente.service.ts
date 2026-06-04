import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  constructor(private http: HttpClient) {}

  getDuenos(): Observable<any> {
    return this.http.get(`${API}/api/dueno`);
  }

  getDueno(id: number): Observable<any> {
    return this.http.get(`${API}/api/dueno/${id}`);
  }

  crearDueno(body: any): Observable<any> {
    return this.http.post(`${API}/api/dueno`, body);
  }

  actualizarDueno(id: number, body: any): Observable<any> {
    return this.http.put(`${API}/api/dueno/${id}`, body);
  }

  vincularDuenoMascota(idDueno: number, idMascota: number): Observable<any> {
    return this.http.post(`${API}/api/duenomascota`, {
      idDueno, idMascota, idAsociado: 1, idEmpleadoCreador: 1
    });
  }

  getEspeciesRazas(): Observable<any> {
    return this.http.get(`${API}/api/especieraza`);
  }
}
