import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ConfiguracionService } from '../../services/configuracion/configuracion.service';
import { AuthService } from '../../services/auth/auth.service';
import { Modal } from '../../shared/components/modal/modal';
import { Tabs } from '../../shared/components/tabs/tabs';
import {
  Asociado, Empleado, RolClinica, Permiso, RolPermiso, DocumentoIdentidad,
  Medicamento, MedicamentoForm, Diagnostico, DiagnosticoForm, UsuarioForm, ConfiguracionSistemaForm
} from '../../services/configuracion/configuracion.model';


function usuarioFormVacio(): UsuarioForm {
  return {
    nombreEmpleado: '', apellidoPaterno: '', apellidoMaterno: '', nroDocumento: '',
    fechaNacimiento: '', idDocumentoIdentidad: null, idRolesClinica: null,
    correo: '', correoElectronico: '', nroTelefono: '', contrasena: '', confirmarContrasena: ''
  };
}

function medicamentoFormVacio(): MedicamentoForm {
  return { codigoMedicamento: '', nombreMedicamento: '', descripcion: '', concentracion: '', presentacion: '' };
}

function diagnosticoFormVacio(): DiagnosticoForm {
  return { codigoDiagnostico: '', nombreDiagnostico: '', descripcion: '' };
}

// Página de Configuración del Sistema: Veterinaria, Usuarios (+ Permisos por Perfil), Catálogos y Sistema.
@Component({
  selector: 'app-configuracion',
  imports: [CommonModule, FormsModule, Modal, Tabs],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion implements OnInit {
  tabsPrincipal = [
    { id: 'veterinaria', label: 'Veterinaria' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'catalogos', label: 'Catálogos' },
    { id: 'sistema', label: 'Sistema' }
  ];
  tabActivo = 'veterinaria';

  tabsCatalogo = [{ id: 'medicamentos', label: 'Medicamentos' }, { id: 'diagnosticos', label: 'Diagnósticos' }];
  tabCatalogoActivo = 'medicamentos';

  // ---- Veterinaria ----
  veterinaria: Asociado | null = null;

  // ---- Usuarios ----
  empleados: Empleado[] = [];
  roles: RolClinica[] = [];
  permisos: Permiso[] = [];
  rolPermisos: RolPermiso[] = [];
  documentos: DocumentoIdentidad[] = [];
  modalNuevoUsuario = false;
  modalEditarUsuario = false;
  guardandoUsuario = false;
  nuevoUsuario: UsuarioForm = usuarioFormVacio();
  editandoUsuario: UsuarioForm | null = null;

  // ---- Catálogos ----
  medicamentos: Medicamento[] = [];
  diagnosticos: Diagnostico[] = [];
  modalNuevoMed = false;
  modalEditarMed = false;
  nuevoMed: MedicamentoForm = medicamentoFormVacio();
  editandoMed: Medicamento | null = null;
  modalNuevoDiag = false;
  modalEditarDiag = false;
  nuevoDiag: DiagnosticoForm = diagnosticoFormVacio();
  editandoDiag: Diagnostico | null = null;

  // ---- Sistema ----
  sistema: ConfiguracionSistemaForm = { zonaHoraria: 'GMT-5 (Lima)', formatoFecha: 'DD/MM/YYYY', moneda: 'Soles (S/)' };
  sistemaId: number | null = null;

  constructor(
    private readonly configService: ConfiguracionService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarVeterinaria();
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarPermisos();
    this.cargarRolPermisos();
    this.cargarDocumentos();
    this.cargarMedicamentos();
    this.cargarDiagnosticos();
    this.cargarSistema();
  }

  private toast(icon: 'success' | 'error', title: string) {
    Swal.fire({ icon, title, timer: 1500, showConfirmButton: false });
  }

  // Nunca debe lanzar: si el cuerpo del error viene con una forma inesperada, con esto
  // igual se muestra el aviso genérico en vez de tragarse el error silenciosamente.
  private extraerMensajeError(e: HttpErrorResponse, generico: string): string {
    try {
      const err = e?.error;
      if (err?.data && typeof err.data === 'object') {
        const msgs = (Object.values(err.data).filter(Boolean) as string[]);
        if (msgs.length === 1) return msgs[0];
        if (msgs.length > 1) {
          return '<ul style="text-align:left; margin:0 auto; display:inline-block; padding-left:1.2em;">'
            + msgs.map(m => `<li>${m}</li>`).join('')
            + '</ul>';
        }
      }
      return err?.message || err?.error || generico;
    } catch {
      return generico;
    }
  }

  // ==================== VETERINARIA ====================
  cargarVeterinaria() {
    const sesion = this.authService.getSesion();
    if (!sesion?.idAsociado) return;
    this.configService.getAsociado(sesion.idAsociado).subscribe({ next: (r) => {
      this.veterinaria = r.data ?? null;
      this.cdr.detectChanges();
    }});
  }

  guardarVeterinaria() {
    if (!this.veterinaria) return;
    this.configService.actualizarAsociado(this.veterinaria.idAsociado, { ...this.veterinaria }).subscribe({
      next: () => this.toast('success', 'Configuración guardada'),
      error: (e: HttpErrorResponse) => Swal.fire({ icon: 'error', title: 'No se pudo guardar', html: this.extraerMensajeError(e, 'Error al guardar') })
    });
  }

  // ==================== USUARIOS ====================
  cargarUsuarios() {
    this.configService.getEmpleados().subscribe({ next: (r) => {
      this.empleados = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  cargarRoles() {
    this.configService.getRolesCatalogo().subscribe({ next: (r) => {
      this.roles = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  cargarPermisos() {
    this.configService.getPermisosCatalogo().subscribe({ next: (r) => {
      this.permisos = this.ordenarPermisos(r.data || []);
      this.cdr.detectChanges();
    }});
  }

  // "Inventario" va al final de la matriz (debajo de Citas); el resto mantiene su orden.
  private ordenarPermisos(permisos: Permiso[]): Permiso[] {
    return [...permisos].sort((a, b) => {
      const aAlFinal = a.nombrePermiso.trim().toLowerCase() === 'inventario';
      const bAlFinal = b.nombrePermiso.trim().toLowerCase() === 'inventario';
      return Number(aAlFinal) - Number(bAlFinal);
    });
  }

  cargarRolPermisos() {
    this.configService.getRolPermisos().subscribe({ next: (r) => {
      this.rolPermisos = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  cargarDocumentos() {
    this.configService.getDocumentosIdentidad().subscribe({ next: (r) => {
      this.documentos = r.data || [];
      // Si el catálogo llega después de haber abierto el modal "Nuevo Usuario" (carrera con
      // ngOnInit), el select ya se ve con la primera opción pero el modelo se había quedado
      // en null; lo completamos para que no falle la validación en silencio.
      if (this.modalNuevoUsuario && this.nuevoUsuario.idDocumentoIdentidad == null) {
        this.nuevoUsuario.idDocumentoIdentidad = this.documentos[0]?.idDocumentoIdentidad ?? null;
      }
      this.cdr.detectChanges();
    }});
  }

  nombreRol(idRolesClinica: number): string {
    return this.roles.find(r => r.idRoles === idRolesClinica)?.nombreRol || '—';
  }

  // Colores fijos para roles conocidos; el resto cicla por la paleta según su posición en el catálogo.
  private readonly coloresRol: Record<string, string> = {
    administrador: 'badge-purple',
    veterinario: 'badge-blue',
    recepcionista: 'badge-teal'
  };
  private readonly paletaRolFallback = ['badge-indigo', 'badge-pink', 'badge-warning', 'badge-gray'];

  claseRol(idRolesClinica: number): string {
    const nombre = this.nombreRol(idRolesClinica).trim().toLowerCase();
    if (this.coloresRol[nombre]) return this.coloresRol[nombre];
    const idx = this.roles.findIndex(r => r.idRoles === idRolesClinica);
    return this.paletaRolFallback[idx % this.paletaRolFallback.length] || 'badge-gray';
  }

  private toLocalDateTime(fecha: string): string {
    return fecha ? `${fecha}T00:00:00` : fecha;
  }

  abrirNuevoUsuario() {
    this.nuevoUsuario = { ...usuarioFormVacio(), idDocumentoIdentidad: this.documentos[0]?.idDocumentoIdentidad ?? null };
    this.guardandoUsuario = false;
    this.modalNuevoUsuario = true;
  }

  guardarNuevoUsuario() {
    if (this.guardandoUsuario) return; // evita doble envío si hacen doble clic
    const u = this.nuevoUsuario;
    if (!u.nombreEmpleado || !u.apellidoPaterno || !u.apellidoMaterno || !u.nroDocumento || !u.fechaNacimiento
        || !u.idDocumentoIdentidad || !u.idRolesClinica || !u.correo || !u.contrasena) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos obligatorios (*)' });
      return;
    }
    if (u.contrasena !== u.confirmarContrasena) {
      Swal.fire({ icon: 'warning', title: 'Las contraseñas no coinciden' });
      return;
    }
    this.guardandoUsuario = true;
    this.configService.crearEmpleado({
      correo: u.correo, contrasena: u.contrasena, nombreEmpleado: u.nombreEmpleado,
      apellidoPaterno: u.apellidoPaterno, apellidoMaterno: u.apellidoMaterno, nroDocumento: u.nroDocumento,
      fechaNacimiento: this.toLocalDateTime(u.fechaNacimiento), idDocumentoIdentidad: +u.idDocumentoIdentidad,
      idRolesClinica: +u.idRolesClinica, correoElectronico: u.correoElectronico || null, nroTelefono: u.nroTelefono || null
    }).subscribe({
      next: () => {
        this.guardandoUsuario = false;
        this.modalNuevoUsuario = false;
        this.toast('success', 'Usuario creado');
        this.cargarUsuarios();
      },
      error: (e: HttpErrorResponse) => {
        this.guardandoUsuario = false;
        Swal.fire({ icon: 'error', title: 'No se pudo crear', html: this.extraerMensajeError(e, 'Error al crear usuario') });
      }
    });
  }

  abrirEditarUsuario(e: Empleado) {
    this.configService.getEmpleado(e.idEmpleadoAsociado).subscribe({ next: (r) => {
      const d = r.data;
      if (!d) return;
      this.editandoUsuario = {
        idEmpleadoAsociado: d.idEmpleadoAsociado, nombreEmpleado: d.nombreEmpleado,
        apellidoPaterno: d.apellidoPaterno, apellidoMaterno: d.apellidoMaterno, nroDocumento: d.nroDocumento,
        fechaNacimiento: d.fechaNacimiento ? d.fechaNacimiento.substring(0, 10) : '',
        idDocumentoIdentidad: d.idDocumentoIdentidad, idRolesClinica: d.idRolesClinica,
        correo: d.correo, correoElectronico: d.correoElectronico || '', nroTelefono: d.nroTelefono || '',
        contrasena: '', confirmarContrasena: ''
      };
      this.guardandoUsuario = false;
      this.modalEditarUsuario = true;
      this.cdr.detectChanges();
    }});
  }

  guardarEdicionUsuario() {
    if (this.guardandoUsuario) return; // evita doble envío si hacen doble clic
    const u = this.editandoUsuario;
    if (!u || !u.nombreEmpleado || !u.apellidoPaterno || !u.apellidoMaterno || !u.nroDocumento || !u.idRolesClinica || !u.correo) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos obligatorios (*)' });
      return;
    }
    if (u.contrasena && u.contrasena !== u.confirmarContrasena) {
      Swal.fire({ icon: 'warning', title: 'Las contraseñas no coinciden' });
      return;
    }
    this.guardandoUsuario = true;
    this.configService.actualizarEmpleado(u.idEmpleadoAsociado!, {
      correo: u.correo, contrasena: u.contrasena || null, nombreEmpleado: u.nombreEmpleado,
      apellidoPaterno: u.apellidoPaterno, apellidoMaterno: u.apellidoMaterno, nroDocumento: u.nroDocumento,
      fechaNacimiento: u.fechaNacimiento ? this.toLocalDateTime(u.fechaNacimiento) : null,
      idDocumentoIdentidad: u.idDocumentoIdentidad ? +u.idDocumentoIdentidad : null,
      idRolesClinica: +u.idRolesClinica, correoElectronico: u.correoElectronico || null, nroTelefono: u.nroTelefono || null
    }).subscribe({
      next: () => {
        this.guardandoUsuario = false;
        this.modalEditarUsuario = false;
        this.toast('success', 'Usuario actualizado');
        this.cargarUsuarios();
      },
      error: (e: HttpErrorResponse) => {
        this.guardandoUsuario = false;
        Swal.fire({ icon: 'error', title: 'No se pudo actualizar', html: this.extraerMensajeError(e, 'Error al actualizar') });
      }
    });
  }

  toggleEstadoUsuario(e: Empleado) {
    this.configService.actualizarEmpleado(e.idEmpleadoAsociado, { estado: !e.estado }).subscribe({
      next: () => this.cargarUsuarios(),
      error: () => Swal.fire({ icon: 'error', title: 'No se pudo cambiar el estado' })
    });
  }

  eliminarUsuario(e: Empleado) {
    Swal.fire({
      title: '¿Eliminar usuario?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#DC2626', cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.configService.eliminarEmpleado(e.idEmpleadoAsociado).subscribe({
        next: () => { this.toast('success', 'Usuario eliminado'); this.cargarUsuarios(); },
        error: () => Swal.fire({ icon: 'error', title: 'Error al eliminar' })
      });
    });
  }

  // ==================== Matriz Permisos por Perfil ====================
  idRolPermisoDe(idRolesClinica: number, idPermiso: number): number | null {
    return this.rolPermisos.find(rp => rp.idRolesClinica === idRolesClinica && rp.idPermiso === idPermiso)?.idRolPermiso ?? null;
  }

  tienePermiso(idRolesClinica: number, idPermiso: number): boolean {
    return this.idRolPermisoDe(idRolesClinica, idPermiso) !== null;
  }

  toggleCelda(idRolesClinica: number, idPermiso: number) {
    const idRolPermiso = this.idRolPermisoDe(idRolesClinica, idPermiso);
    if (idRolPermiso) {
      this.configService.eliminarRolPermiso(idRolPermiso).subscribe({ next: () => this.cargarRolPermisos() });
    } else {
      this.configService.crearRolPermiso(idRolesClinica, idPermiso).subscribe({ next: () => this.cargarRolPermisos() });
    }
  }

  agregarRol() {
    Swal.fire({
      title: 'Nuevo Rol', input: 'text', inputLabel: 'Nombre del rol', inputPlaceholder: 'Ej: Veterinario',
      showCancelButton: true, confirmButtonText: 'Crear', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;
      this.configService.crearRol(result.value).subscribe({
        next: () => { this.toast('success', 'Rol creado'); this.cargarRoles(); },
        error: (e: HttpErrorResponse) => Swal.fire({ icon: 'error', title: 'No se pudo crear el rol', html: this.extraerMensajeError(e, 'Error al crear') })
      });
    });
  }

  agregarModulo() {
    Swal.fire({
      title: 'Nuevo Módulo', showCancelButton: true, confirmButtonText: 'Crear', cancelButtonText: 'Cancelar',
      html:
        '<input id="swal-nombre" class="swal2-input" placeholder="Nombre del módulo (Ej: Inventario)">' +
        '<input id="swal-desc" class="swal2-input" placeholder="Descripción">',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement)?.value?.trim();
        const desc = (document.getElementById('swal-desc') as HTMLInputElement)?.value?.trim();
        if (!nombre || !desc) {
          Swal.showValidationMessage('Completa nombre y descripción');
          return false;
        }
        return { nombre, desc };
      }
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;
      this.configService.crearPermiso(result.value.nombre, result.value.desc).subscribe({
        next: () => { this.toast('success', 'Módulo creado'); this.cargarPermisos(); },
        error: (e: HttpErrorResponse) => Swal.fire({ icon: 'error', title: 'No se pudo crear el módulo', html: this.extraerMensajeError(e, 'Error al crear') })
      });
    });
  }

  // ==================== CATÁLOGOS ====================
  cargarMedicamentos() {
    this.configService.getMedicamentos().subscribe({ next: (r) => {
      this.medicamentos = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  cargarDiagnosticos() {
    this.configService.getDiagnosticos().subscribe({ next: (r) => {
      this.diagnosticos = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  // ===================== Medicamentos =====================
  abrirNuevoMed() {
    this.nuevoMed = medicamentoFormVacio();
    this.modalNuevoMed = true;
  }

  guardarNuevoMed() {
    const m = this.nuevoMed;
    if (!m.codigoMedicamento || !m.nombreMedicamento || !m.descripcion || !m.concentracion || !m.presentacion) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos' });
      return;
    }
    this.configService.crearMedicamento(m).subscribe({
      next: () => { this.modalNuevoMed = false; this.toast('success', 'Medicamento registrado'); this.cargarMedicamentos(); },
      error: (e: HttpErrorResponse) => Swal.fire({ icon: 'error', title: 'No se pudo registrar', html: this.extraerMensajeError(e, 'Error al registrar') })
    });
  }

  abrirEditarMed(m: Medicamento) {
    this.configService.getMedicamento(m.idMedicamento).subscribe({ next: (r) => {
      if (!r.data) return;
      this.editandoMed = { ...r.data };
      this.modalEditarMed = true;
      this.cdr.detectChanges();
    }});
  }

  guardarEdicionMed() {
    const m = this.editandoMed;
    if (!m || !m.codigoMedicamento || !m.nombreMedicamento || !m.descripcion || !m.concentracion || !m.presentacion) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos' });
      return;
    }
    this.configService.actualizarMedicamento(m.idMedicamento, m).subscribe({
      next: () => { this.modalEditarMed = false; this.toast('success', 'Medicamento actualizado'); this.cargarMedicamentos(); },
      error: (e: HttpErrorResponse) => Swal.fire({ icon: 'error', title: 'No se pudo actualizar', html: this.extraerMensajeError(e, 'Error al actualizar') })
    });
  }

  eliminarMed(m: Medicamento) {
    Swal.fire({
      title: '¿Eliminar medicamento?', icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#DC2626', cancelButtonColor: '#64748B', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.configService.eliminarMedicamento(m.idMedicamento).subscribe({
        next: () => { this.toast('success', 'Medicamento eliminado'); this.cargarMedicamentos(); },
        error: () => Swal.fire({ icon: 'error', title: 'Error al eliminar' })
      });
    });
  }


  // ============== Diagnósticos ================
  abrirNuevoDiag() {
    this.nuevoDiag = diagnosticoFormVacio();
    this.modalNuevoDiag = true;
  }

  guardarNuevoDiag() {
    const d = this.nuevoDiag;
    if (!d.codigoDiagnostico || !d.nombreDiagnostico || !d.descripcion) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos' });
      return;
    }
    this.configService.crearDiagnostico(d).subscribe({
      next: () => { this.modalNuevoDiag = false; this.toast('success', 'Diagnóstico registrado'); this.cargarDiagnosticos(); },
      error: (e: HttpErrorResponse) => Swal.fire({ icon: 'error', title: 'No se pudo registrar', html: this.extraerMensajeError(e, 'Error al registrar') })
    });
  }

  abrirEditarDiag(d: Diagnostico) {
    this.editandoDiag = { ...d };
    this.modalEditarDiag = true;
  }

  guardarEdicionDiag() {
    const d = this.editandoDiag;
    if (!d || !d.codigoDiagnostico || !d.nombreDiagnostico || !d.descripcion) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos' });
      return;
    }
    this.configService.actualizarDiagnostico(d.idDiagnosticoCatalogo, d).subscribe({
      next: () => { this.modalEditarDiag = false; this.toast('success', 'Diagnóstico actualizado'); this.cargarDiagnosticos(); },
      error: (e: HttpErrorResponse) => Swal.fire({ icon: 'error', title: 'No se pudo actualizar', html: this.extraerMensajeError(e, 'Error al actualizar') })
    });
  }

  eliminarDiag(d: Diagnostico) {
    Swal.fire({
      title: '¿Eliminar diagnóstico?', icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#DC2626', cancelButtonColor: '#64748B', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.configService.eliminarDiagnostico(d.idDiagnosticoCatalogo).subscribe({
        next: () => { this.toast('success', 'Diagnóstico eliminado'); this.cargarDiagnosticos(); },
        error: () => Swal.fire({ icon: 'error', title: 'Error al eliminar' })
      });
    });
  }

  // ==================== SISTEMA ====================
  cargarSistema() {
    this.configService.getConfiguracionSistema().subscribe({ next: (r) => {
      if (r.data) {
        this.sistema = { zonaHoraria: r.data.zonaHoraria, formatoFecha: r.data.formatoFecha, moneda: r.data.moneda };
        this.sistemaId = r.data.idConfiguracionSistema;
      }
      this.cdr.detectChanges();
    }});
  }

  guardarSistema() {
    if (this.sistemaId) {
      this.configService.actualizarConfiguracionSistema(this.sistemaId, this.sistema).subscribe({
        next: () => this.toast('success', 'Configuración guardada'),
        error: () => Swal.fire({ icon: 'error', title: 'No se pudo guardar' })
      });
    } else {
      this.configService.crearConfiguracionSistema(this.sistema).subscribe({
        next: () => { this.toast('success', 'Configuración guardada'); this.cargarSistema(); },
        error: () => Swal.fire({ icon: 'error', title: 'No se pudo guardar' })
      });
    }
  }
}
