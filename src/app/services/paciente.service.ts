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
    return this.http.post(`${API}/api/dueno/crear`, body);
  }

  // Actualiza los datos de un dueño
  actualizarDueno(id: number, body: any): Observable<any> {
    return this.http.put(`${API}/api/dueno/${id}`, body);
  }

  // Vincula un dueño con una mascota en la tabla Dueno_Mascota (relación N:M)
  vincularDuenoMascota(idDueno: number, idMascota: number): Observable<any> {
    return this.http.post(`${API}/api/duenomascota/crear`, { idDueno, idMascota });
  }

  // Lista las especies del catálogo (registros raíz de la tabla EspecieRaza)
  getEspecies(): Observable<any> {
    return this.http.get(`${API}/api/especie/catalogo`);
  }

  // Lista las razas del catálogo, cada una con su idEspecie de referencia
  getRazas(): Observable<any> {
    return this.http.get(`${API}/api/raza/catalogo`);
  }
}
