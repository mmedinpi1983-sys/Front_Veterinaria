import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, Asociado, Empleado, EmpleadoDetalle, EmpleadoCreateRequest, EmpleadoUpdateRequest,
  RolClinica, Permiso, RolPermiso, DocumentoIdentidad, Medicamento, MedicamentoForm,
  Diagnostico, DiagnosticoForm, ConfiguracionSistema, ConfiguracionSistemaForm,
  Especie, EspecieDetalle, EspecieCat, Raza, RazaDetalle
} from './configuracion.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

// Servicio del módulo de Configuración - agrupa Veterinaria (Asociado), Usuarios (EmpleadoAsociado),
// Roles y Permisos (matriz Rol_Permiso), Catálogos (Medicamentos/Diagnósticos) y Configuración de Sistema.
@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  constructor(private http: HttpClient) {}

  // Veterinaria (datos de la clínica)
  getAsociado(id: number): Observable<ApiResponse<Asociado>> { return this.http.get<ApiResponse<Asociado>>(`${API}/api/asociado/${id}`); }
  actualizarAsociado(id: number, body: Asociado): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/asociado/${id}`, body); }

  // Usuarios (empleados)
  getEmpleados(q = '', estado: boolean | null = null): Observable<ApiResponse<Empleado[]>> {
    const params: string[] = [];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (estado !== null) params.push(`estado=${estado}`);
    return this.http.get<ApiResponse<Empleado[]>>(`${API}/api/empleadoasociado${params.length ? '?' + params.join('&') : ''}`);
  }
  getEmpleado(id: number): Observable<ApiResponse<EmpleadoDetalle>> { return this.http.get<ApiResponse<EmpleadoDetalle>>(`${API}/api/empleadoasociado/${id}`); }
  crearEmpleado(body: EmpleadoCreateRequest): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/empleadoasociado/crear`, body); }
  actualizarEmpleado(id: number, body: EmpleadoUpdateRequest): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/empleadoasociado/${id}`, body); }
  eliminarEmpleado(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/empleadoasociado/${id}`, { body: { idEmpleadoAsociado: id } });
  }

  // Roles de clínica
  getRolesCatalogo(): Observable<ApiResponse<RolClinica[]>> { return this.http.get<ApiResponse<RolClinica[]>>(`${API}/api/rolesclinica/catalogo`); }
  crearRol(nombreRol: string): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/rolesclinica/crear`, { nombreRol }); }

  // Permisos (módulos del sistema)
  getPermisosCatalogo(): Observable<ApiResponse<Permiso[]>> { return this.http.get<ApiResponse<Permiso[]>>(`${API}/api/permiso/catalogo`); }
  crearPermiso(nombrePermiso: string, descripcionPermiso: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/permiso/crear`, { nombrePermiso, descripcionPermiso });
  }

  // Rol_Permiso (matriz de permisos por perfil)
  getRolPermisos(): Observable<ApiResponse<RolPermiso[]>> { return this.http.get<ApiResponse<RolPermiso[]>>(`${API}/api/rolpermiso`); }
  crearRolPermiso(idRolesClinica: number, idPermiso: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${API}/api/rolpermiso/crear`, { idRolesClinica, idPermiso });
  }
  eliminarRolPermiso(idRolPermiso: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/rolpermiso/${idRolPermiso}`, { body: { idRolPermiso } });
  }

  // Catálogo de medicamentos
  getMedicamentos(): Observable<ApiResponse<Medicamento[]>> { return this.http.get<ApiResponse<Medicamento[]>>(`${API}/api/medicamentocatalogo`); }
  getMedicamento(id: number): Observable<ApiResponse<Medicamento>> { return this.http.get<ApiResponse<Medicamento>>(`${API}/api/medicamentocatalogo/${id}`); }
  crearMedicamento(body: MedicamentoForm): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/medicamentocatalogo/crear`, body); }
  actualizarMedicamento(id: number, body: MedicamentoForm): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/medicamentocatalogo/${id}`, body); }
  eliminarMedicamento(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/medicamentocatalogo/${id}`, { body: { idMedicamento: id } });
  }

  // Catálogo de diagnósticos
  getDiagnosticos(): Observable<ApiResponse<Diagnostico[]>> { return this.http.get<ApiResponse<Diagnostico[]>>(`${API}/api/diagnosticocatalogo`); }
  crearDiagnostico(body: DiagnosticoForm): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/diagnosticocatalogo/crear`, body); }
  actualizarDiagnostico(id: number, body: DiagnosticoForm): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/diagnosticocatalogo/${id}`, body); }
  eliminarDiagnostico(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/diagnosticocatalogo/${id}`, { body: { idDiagnosticoCatalogo: id } });
  }

  // Catálogo de Especies (tabla EspecieRaza raíz)
  getEspecies(nombre: string, estado: boolean | null): Observable<ApiResponse<Especie[]>> {
    return this.http.post<ApiResponse<Especie[]>>(`${API}/api/especie/listado`, { nombre: nombre || '', idRaza: null, estado, idAsociado: null });
  }
  getEspecie(id: number): Observable<ApiResponse<EspecieDetalle>> { return this.http.get<ApiResponse<EspecieDetalle>>(`${API}/api/especie/${id}`); }
  getEspeciesCatalogo(): Observable<ApiResponse<EspecieCat[]>> { return this.http.get<ApiResponse<EspecieCat[]>>(`${API}/api/especie/catalogo`); }
  crearEspecie(nombre: string): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/especie/crear`, { nombre }); }
  actualizarEspecie(id: number, body: { nombre: string; estado: boolean }): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/especie/${id}`, body); }
  eliminarEspecie(id: number, idUsuario: number, idAsociado: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/especie`, { body: { idEspecie: id, idUsuario, idAsociado } });
  }

  // Catálogo de Razas (tabla EspecieRaza con especie padre)
  getRazas(nombre: string, estado: boolean | null): Observable<ApiResponse<Raza[]>> {
    return this.http.post<ApiResponse<Raza[]>>(`${API}/api/raza/listado`, { nombre: nombre || '', idEspecie: null, estado });
  }
  getRaza(id: number): Observable<ApiResponse<RazaDetalle>> { return this.http.get<ApiResponse<RazaDetalle>>(`${API}/api/raza/${id}`); }
  crearRaza(body: { nombre: string; idEspecie: number }): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/raza/crear`, body); }
  actualizarRaza(id: number, body: { nombre: string; idEspecie: number; estado: boolean }): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/raza/${id}`, body); }
  eliminarRaza(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API}/api/raza`, { body: { idRaza: id } });
  }

  // Catálogo de tipos de documento (para el select del formulario de usuario)
  getDocumentosIdentidad(): Observable<ApiResponse<DocumentoIdentidad[]>> { return this.http.get<ApiResponse<DocumentoIdentidad[]>>(`${API}/api/documentoidentidad/catalogo`); }

  // Configuración de sistema (zona horaria / formato de fecha / moneda)
  getConfiguracionSistema(): Observable<ApiResponse<ConfiguracionSistema | null>> { return this.http.get<ApiResponse<ConfiguracionSistema | null>>(`${API}/api/configuracionsistema/mia`); }
  crearConfiguracionSistema(body: ConfiguracionSistemaForm): Observable<ApiResponse<void>> { return this.http.post<ApiResponse<void>>(`${API}/api/configuracionsistema/crear`, body); }
  actualizarConfiguracionSistema(id: number, body: ConfiguracionSistemaForm): Observable<ApiResponse<void>> { return this.http.put<ApiResponse<void>>(`${API}/api/configuracionsistema/${id}`, body); }
}
