import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, DuenoListItem, DuenoDetalle, DuenoCreateRequest, DuenoUpdateRequest,
  EspecieCatalogo, RazaCatalogo
} from './pacientes.model';

const API = environment.apiUrl;

// Servicio de pacientes - gestiona dueños y el vínculo entre dueño y mascota
@Injectable({ providedIn: 'root' })
export class PacienteService {
  constructor(private http: HttpClient) {}

  // Lista todos los dueños activos
  getDuenos(): Observable<ApiResponse<DuenoListItem[]>> {
    return this.http.get<ApiResponse<DuenoListItem[]>>(`${API}/api/dueno`);
  }

  // Obtiene los datos completos de un dueño por ID (usado al editar paciente)
  getDueno(id: number): Observable<ApiResponse<DuenoDetalle>> {
    return this.http.get<ApiResponse<DuenoDetalle>>(`${API}/api/dueno/${id}`);
  }

  // Registra un nuevo dueño/propietario
  crearDueno(body: DuenoCreateRequest): Observable<ApiResponse<{ idDueno: number }>> {
    return this.http.post<ApiResponse<{ idDueno: number }>>(`${API}/api/dueno/crear`, body);
  }

  // Actualiza los datos de un dueño
  actualizarDueno(id: number, body: DuenoUpdateRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${API}/api/dueno/${id}`, body);
  }

  // Vincula un dueño con una mascota en la tabla Dueno_Mascota (relación N:M)
  vincularDuenoMascota(idDueno: number, idMascota: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/duenomascota/crear`, { idDueno, idMascota });
  }

  // Lista las especies del catálogo (registros raíz de la tabla EspecieRaza)
  getEspecies(): Observable<ApiResponse<EspecieCatalogo[]>> {
    return this.http.get<ApiResponse<EspecieCatalogo[]>>(`${API}/api/especie/catalogo`);
  }

  // Lista las razas del catálogo, cada una con su idEspecie de referencia
  getRazas(): Observable<ApiResponse<RazaCatalogo[]>> {
    return this.http.get<ApiResponse<RazaCatalogo[]>>(`${API}/api/raza/catalogo`);
  }
}
