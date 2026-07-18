import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/components/modal/modal';
import { Pagination } from '../../shared/components/pagination/pagination';
import { ProgramacionService } from '../../services/programacion/programacion.service';
import Swal from 'sweetalert2';

// Programación de Veterinarios: turnos de trabajo (Programacion) y el catálogo de Turnos
// (Mañana/Tarde/Noche) que se usa para armarlos.
@Component({
  selector: 'app-programacion',
  imports: [CommonModule, FormsModule, Modal, Pagination],
  templateUrl: './programacion.html',
  styleUrl: './programacion.css'
})
export class Programacion implements OnInit {
  tab: 'programaciones' | 'turnos' = 'programaciones';

  // ---- Programaciones ----
  programaciones: any[] = [];
  programacionesPag: any[] = [];
  itemsPorPag = 10;
  pagProg = 1;
  totalPagProg = 1;
  filtroProg = { fecha: '', idEmpleadoRegistrador: '' };
  filtroTimeout: any;
  modalProgVisible = false;
  editandoProg = false;
  formProg: any = this.progVacio();

  empleados: any[] = [];
  turnosCatalogo: any[] = [];
  estados: any[] = [];
  categorias: any[] = [];
  servicios: any[] = [];

  // ---- Turnos ----
  turnos: any[] = [];
  turnosPag: any[] = [];
  pagTurno = 1;
  totalPagTurno = 1;
  modalTurnoVisible = false;
  editandoTurno = false;
  formTurno: any = this.turnoVacio();

  constructor(private prog: ProgramacionService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarProgramaciones();
    this.cargarTurnos();
    this.prog.getEmpleados().subscribe({ next: (r: any) => { this.empleados = r.data || []; this.cdr.detectChanges(); } });
    this.prog.getEstadosProgramacion().subscribe({ next: (r: any) => { this.estados = r.data || []; this.cdr.detectChanges(); } });
    this.prog.getCategorias().subscribe({ next: (r: any) => { this.categorias = r.data || []; this.cdr.detectChanges(); } });
    this.prog.getServicios().subscribe({ next: (r: any) => { this.servicios = r.data || []; this.cdr.detectChanges(); } });
  }

  cambiarTab(t: 'programaciones' | 'turnos') {
    this.tab = t;
  }

  // ==================== PROGRAMACIONES ====================
  cargarProgramaciones() {
    const p: any = {};
    if (this.filtroProg.fecha) p['fecha'] = this.filtroProg.fecha;
    if (this.filtroProg.idEmpleadoRegistrador) p['idEmpleadoRegistrador'] = this.filtroProg.idEmpleadoRegistrador;
    this.prog.getProgramaciones(p).subscribe({ next: (r: any) => {
      this.programaciones = r.data || [];
      this.pagProg = 1;
      this.paginarProg();
      this.cdr.detectChanges();
    }});
  }

  onFiltroProg() {
    clearTimeout(this.filtroTimeout);
    this.filtroTimeout = setTimeout(() => this.cargarProgramaciones(), 350);
  }

  paginarProg() {
    this.totalPagProg = Math.max(1, Math.ceil(this.programaciones.length / this.itemsPorPag));
    const ini = (this.pagProg - 1) * this.itemsPorPag;
    this.programacionesPag = this.programaciones.slice(ini, ini + this.itemsPorPag);
  }
  cambiarPagProg(p: number) { if (p < 1 || p > this.totalPagProg) return; this.pagProg = p; this.paginarProg(); }

  // Solo turnos activos son elegibles para armar una programación nueva (los inactivos
  // se muestran igual en el select cuando ya están asignados a la fila que se está editando).
  get turnosParaSelect(): any[] {
    if (!this.editandoProg) return this.turnosCatalogo.filter(t => t.estado);
    return this.turnosCatalogo;
  }

  progVacio() {
    return { fecha: '', idTurno: '', idEmpleadoRegistrador: '', idEstadoProgramacion: '', idCategoria: '', idServicio: '', ambiente: '', descripcion: '' };
  }

  abrirNuevoProg() {
    this.editandoProg = false;
    this.formProg = this.progVacio();
    if (this.estados.length === 1) this.formProg.idEstadoProgramacion = this.estados[0].idEstadoProgramacion;
    this.modalProgVisible = true;
  }

  abrirEditarProg(row: any) {
    this.prog.getProgramacion(row.idProgramacion).subscribe({ next: (r: any) => {
      const d = r.data || {};
      this.formProg = {
        fecha: (d.fecha || '').substring(0, 10),
        idTurno: d.idTurno, idEmpleadoRegistrador: d.idEmpleadoRegistrador,
        idEstadoProgramacion: d.idEstadoProgramacion, idCategoria: d.idCategoria, idServicio: d.idServicio,
        ambiente: d.ambiente || '', descripcion: d.descripcion || ''
      };
      this.programacionSeleccionadaId = row.idProgramacion;
      this.editandoProg = true;
      this.modalProgVisible = true;
      this.cdr.detectChanges();
    }});
  }

  guardarProg() {
    const f = this.formProg;
    if (!f.fecha || !f.idTurno || !f.idEmpleadoRegistrador || !f.idEstadoProgramacion || !f.idCategoria || !f.idServicio) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos obligatorios (*)', timer: 2000, showConfirmButton: false });
      return;
    }
    const body = {
      fecha: f.fecha, idTurno: +f.idTurno, idEmpleadoRegistrador: +f.idEmpleadoRegistrador,
      idEstadoProgramacion: +f.idEstadoProgramacion, idCategoria: +f.idCategoria, idServicio: +f.idServicio,
      ambiente: f.ambiente || null, descripcion: f.descripcion || null
    };
    const obs = this.editandoProg
      ? this.prog.actualizarProgramacion(this.programacionSeleccionadaId!, body)
      : this.prog.crearProgramacion(body);
    obs.subscribe({
      next: () => {
        this.modalProgVisible = false;
        Swal.fire({ icon: 'success', title: this.editandoProg ? 'Programación actualizada' : 'Programación registrada', timer: 1500, showConfirmButton: false });
        this.cargarProgramaciones();
      },
      error: (e: any) => Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: e?.error?.message || e?.error?.error || '' })
    });
  }

  // id de la fila que se está editando (seteado al abrir el modal de edición)
  programacionSeleccionadaId: number | null = null;

  eliminarProg(row: any) {
    Swal.fire({
      title: '¿Eliminar esta programación?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#DC2626', cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.prog.eliminarProgramacion(row.idProgramacion).subscribe({
        next: () => { Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1300, showConfirmButton: false }); this.cargarProgramaciones(); },
        error: () => Swal.fire({ icon: 'error', title: 'Error al eliminar' })
      });
    });
  }

  nombreEmpleado(id: number): string {
    const e = this.empleados.find(x => x.idEmpleadoAsociado === id);
    return e ? `${e.nombreEmpleado} ${e.apellidoPaterno}` : '';
  }

  // ==================== TURNOS ====================
  cargarTurnos() {
    this.prog.getTurnos().subscribe({ next: (r: any) => {
      this.turnos = r.data || [];
      this.turnosCatalogo = this.turnos;
      this.pagTurno = 1;
      this.paginarTurno();
      this.cdr.detectChanges();
    }});
  }

  paginarTurno() {
    this.totalPagTurno = Math.max(1, Math.ceil(this.turnos.length / this.itemsPorPag));
    const ini = (this.pagTurno - 1) * this.itemsPorPag;
    this.turnosPag = this.turnos.slice(ini, ini + this.itemsPorPag);
  }
  cambiarPagTurno(p: number) { if (p < 1 || p > this.totalPagTurno) return; this.pagTurno = p; this.paginarTurno(); }

  turnoVacio() {
    return { idTurno: null as number | null, nombre: '', horaInicio: '', horaFin: '', estado: true };
  }

  abrirNuevoTurno() {
    this.editandoTurno = false;
    this.formTurno = this.turnoVacio();
    this.modalTurnoVisible = true;
  }

  abrirEditarTurno(t: any) {
    this.editandoTurno = true;
    this.formTurno = { idTurno: t.idTurno, nombre: t.nombre, horaInicio: (t.horaInicio || '').substring(0, 5), horaFin: (t.horaFin || '').substring(0, 5), estado: t.estado };
    this.modalTurnoVisible = true;
  }

  guardarTurno() {
    const f = this.formTurno;
    if (!f.nombre || !f.horaInicio || !f.horaFin) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos obligatorios (*)', timer: 2000, showConfirmButton: false });
      return;
    }
    const body: any = { nombre: f.nombre, horaInicio: f.horaInicio + ':00', horaFin: f.horaFin + ':00' };
    const obs = this.editandoTurno
      ? this.prog.actualizarTurno(f.idTurno, { ...body, estado: f.estado })
      : this.prog.crearTurno(body);
    obs.subscribe({
      next: () => {
        this.modalTurnoVisible = false;
        Swal.fire({ icon: 'success', title: this.editandoTurno ? 'Turno actualizado' : 'Turno creado', timer: 1500, showConfirmButton: false });
        this.cargarTurnos();
      },
      error: (e: any) => Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: e?.error?.message || e?.error?.error || '' })
    });
  }

  toggleEstadoTurno(t: any) {
    this.prog.actualizarTurno(t.idTurno, { nombre: t.nombre, horaInicio: t.horaInicio, horaFin: t.horaFin, estado: !t.estado }).subscribe({
      next: () => this.cargarTurnos(),
      error: () => Swal.fire({ icon: 'error', title: 'No se pudo cambiar el estado' })
    });
  }

  eliminarTurno(t: any) {
    Swal.fire({
      title: '¿Eliminar este turno?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#DC2626', cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.prog.eliminarTurno(t.idTurno).subscribe({
        next: () => { Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1300, showConfirmButton: false }); this.cargarTurnos(); },
        error: () => Swal.fire({ icon: 'error', title: 'Error al eliminar' })
      });
    });
  }
}
