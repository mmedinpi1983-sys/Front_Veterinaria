import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Servicio de pacientes - gestiona dueños y el vínculo entre dueño y mascota
@Injectable({ providedIn: 'root' })
export class PacienteService {
  constructor(private http: HttpClient) {}

  // Lista todos los dueños activos
  getDuenos(): Observable<any> {
    return this.http.get(`${API}/api/dueno`);
  }

  // Obtiene los datos completos de un dueño por ID (usado al editar paciente)
  getDueno(id: number): Observable<any> {
    return this.http.get(`${API}/api/dueno/${id}`);
  }

  // Registra un nuevo dueño/propietario
  crearDueno(body: any): Observable<any> {
    return this.http.post(`${API}/api/dueno`, body);
  }

  // Actualiza los datos de un dueño
  actualizarDueno(id: number, body: any): Observable<any> {
    return this.http.put(`${API}/api/dueno/${id}`, body);
  }

  // Vincula un dueño con una mascota en la tabla Dueno_Mascota (relación N:M)
  vincularDuenoMascota(idDueno: number, idMascota: number): Observable<any> {
    return this.http.post(`${API}/api/duenomascota`, {
      idDueno, idMascota, idAsociado: 1, idEmpleadoCreador: 1
    });
  }

  // Lista especies y razas del catálogo (tabla EspecieRaza)
  getEspeciesRazas(): Observable<any> {
    return this.http.get(`${API}/api/especieraza`);
  }
}
