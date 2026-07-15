// Modelos del módulo de Configuración (Veterinaria, Usuarios, Permisos, Catálogos, Sistema).
// Reflejan los DTO del backend (ver los paquetes Asociado, EmpleadoAsociado, RolesClinica,
// Permiso, RolPermiso, MedicamentoCatalogo, DiagnosticoCatalogo, DocumentoIdentidad y
// ConfiguracionSistema en Backend_Veterinaria).

// Envoltorio genérico de respuesta de la API (ver ApiResponse.java)
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
  errorCode?: string;
}

// ---- Veterinaria (Asociado) ----
export interface Asociado {
  idAsociado: number;
  nombre: string;
  ruc: string;
  nombreDueno: string;
  apellidoDueno: string;
  idNivelSuscripcion: number;
  activo: boolean;
  correoElectronico: string | null;
  nroTelefono: string | null;
  direccion: string | null;
  diasAtencion: string | null;
}

// ---- Usuarios (EmpleadoAsociado) ----
export interface Empleado {
  idEmpleadoAsociado: number;
  correo: string;
  nombreEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDocumento: string;
  idRolesClinica: number;
  estado: boolean;
  fechaCreacion: string;
}

export interface EmpleadoDetalle {
  idEmpleadoAsociado: number;
  idAsociado: number;
  correo: string;
  nombreEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDocumento: string;
  fechaNacimiento: string | null;
  idDocumentoIdentidad: number;
  idRolesClinica: number;
  correoElectronico: string | null;
  nroTelefono: string | null;
  estado: boolean;
}

export interface EmpleadoCreateRequest {
  correo: string;
  contrasena: string;
  nombreEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDocumento: string;
  fechaNacimiento: string;
  idDocumentoIdentidad: number;
  idRolesClinica: number;
  correoElectronico: string | null;
  nroTelefono: string | null;
}

// Body de actualización: todos los campos opcionales (y admiten null) porque el backend
// ignora los que llegan en null/undefined (ver NullValuePropertyMappingStrategy.IGNORE
// en EmpleadoAsociadoMapper) — solo se pisan los campos que sí se mandan.
export interface EmpleadoUpdateRequest {
  correo?: string;
  contrasena?: string | null;
  nombreEmpleado?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nroDocumento?: string;
  fechaNacimiento?: string | null;
  idDocumentoIdentidad?: number | null;
  idRolesClinica?: number;
  correoElectronico?: string | null;
  nroTelefono?: string | null;
  estado?: boolean;
}

// Formulario de alta/edición de usuario en el modal (incluye confirmarContrasena, que
// nunca se envía al backend, solo se usa para validar en el frontend).
export interface UsuarioForm {
  idEmpleadoAsociado?: number;
  nombreEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDocumento: string;
  fechaNacimiento: string;
  idDocumentoIdentidad: number | null;
  idRolesClinica: number | null;
  correo: string;
  correoElectronico: string;
  nroTelefono: string;
  contrasena: string;
  confirmarContrasena: string;
}

// ---- Roles y Permisos ----
export interface RolClinica {
  idRoles: number;
  nombreRol: string;
}

export interface Permiso {
  idPermiso: number;
  nombrePermiso: string;
}

export interface RolPermiso {
  idRolPermiso: number;
  idRolesClinica: number;
  idPermiso: number;
  fechaCreacion?: string;
}

export interface DocumentoIdentidad {
  idDocumentoIdentidad: number;
  descripcion: string;
}

// ---- Catálogo de Medicamentos ----
export interface Medicamento {
  idMedicamento: number;
  codigoMedicamento: string;
  nombreMedicamento: string;
  descripcion: string;
  concentracion: string;
  presentacion: string;
}

export type MedicamentoForm = Omit<Medicamento, 'idMedicamento'>;

// ---- Catálogo de Diagnósticos ----
export interface Diagnostico {
  idDiagnosticoCatalogo: number;
  codigoDiagnostico: string;
  nombreDiagnostico: string;
  descripcion: string;
}

export type DiagnosticoForm = Omit<Diagnostico, 'idDiagnosticoCatalogo'>;

// ---- Sistema ----
export interface ConfiguracionSistema {
  idConfiguracionSistema: number;
  idAsociado: number;
  zonaHoraria: string;
  formatoFecha: string;
  moneda: string;
}

export type ConfiguracionSistemaForm = Omit<ConfiguracionSistema, 'idConfiguracionSistema' | 'idAsociado'>;
