import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/components/modal/modal';
import { Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { MascotaService } from '../../services/mascota.service';
import Swal from 'sweetalert2';

// Página de Gestión de Citas
// Permite listar, filtrar, registrar, reprogramar y cancelar citas veterinarias
// Incluye estadísticas del mes y búsqueda en tiempo real de mascotas
@Component({
  selector: 'app-citas',
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class Citas implements OnInit {
  stats = { total: 0, pendientes: 0, completadas: 0, canceladas: 0 };
  citas: any[] = [];
  citasPaginadas: any[] = [];
  servicios: any[] = [];

    // Variables para la búsqueda de mascotas en tiempo real en el modal "Nueva Cita"
  mascotasBusqueda: any[] = [];
  busquedaMascota = '';
  mascotaSeleccionada: any = null;
  mostrarSugerencias = false;
  busquedaTimeout: any;

  filtros = { busqueda: '', idEstado: '', fechaInicio: '', fechaFin: '' };
  filtrTimeout: any;

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  modalNuevaVisible = false;
  modalDetalleVisible = false;
  modalReprogVisible = false;

  citaSeleccionada: any = null;
  nuevaCita = { idServicio: '', fecha: '', hora: '08:00', motivo: '' };
  reprog = { fecha: '', hora: '', motivo: '' };

  constructor(
    private citaService: CitaService,
    private mascotaService: MascotaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Usar fecha local (no UTC) para evitar desfase por zona horaria de Perú (UTC-5)
    const hoy = new Date();
    const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
    this.filtros.fechaInicio = fechaLocal;
    this.filtros.fechaFin = fechaLocal;
    this.cargarStats();
    this.cargarCitas();
    this.citaService.getServicios().subscribe({ next: (r: any) => { this.servicios = r.data || []; this.cdr.detectChanges(); } });
  }

  cargarStats() {
    this.citaService.getStats().subscribe({ next: (r: any) => {
      if (r.success) { this.stats = r.data; this.cdr.detectChanges(); }
    }});
  }

  cargarCitas() {
    const params: any = {};
    if (this.filtros.busqueda) params['busqueda'] = this.filtros.busqueda;
    if (this.filtros.idEstado) params['idEstado'] = this.filtros.idEstado;
    if (this.filtros.fechaInicio) params['fechaInicio'] = this.filtros.fechaInicio;
    if (this.filtros.fechaFin) params['fechaFin'] = this.filtros.fechaFin;
    this.citaService.getCitasEnriquecidas(params).subscribe({ next: (r: any) => {
      this.citas = r.data || [];
      this.paginaActual = 1;
      this.actualizarPaginacion();
      this.cdr.detectChanges();
    }});
  }

  actualizarPaginacion() {
    this.totalPaginas = Math.max(1, Math.ceil(this.citas.length / this.itemsPorPagina));
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.citasPaginadas = this.citas.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.actualizarPaginacion();
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  onFiltroChange() {
    // Al escribir en el buscador se limpian las fechas para buscar en todas las citas
    if (this.filtros.busqueda) {
      this.filtros.fechaInicio = '';
      this.filtros.fechaFin = '';
    }
    clearTimeout(this.filtrTimeout);
    this.filtrTimeout = setTimeout(() => this.cargarCitas(), 400);
  }

  // Búsqueda en tiempo real de mascotas
  onBusquedaMascota() {
    clearTimeout(this.busquedaTimeout);
    this.mascotaSeleccionada = null;
    if (!this.busquedaMascota.trim()) { this.mascotasBusqueda = []; this.mostrarSugerencias = false; return; }
    this.busquedaTimeout = setTimeout(() => {
      this.mascotaService.buscar(this.busquedaMascota).subscribe({ next: (r: any) => {
        this.mascotasBusqueda = r.data || [];
        this.mostrarSugerencias = this.mascotasBusqueda.length > 0;
        this.cdr.detectChanges();
      }});
    }, 300);
  }

  seleccionarMascota(m: any) {
    this.mascotaSeleccionada = m;
    this.busquedaMascota = m.nombre + (m.nombreDueno ? ' — ' + m.nombreDueno : '');
    this.mostrarSugerencias = false;
  }

  cerrarSugerencias() {
    setTimeout(() => { this.mostrarSugerencias = false; }, 200);
  }

  abrirModalNueva() {
    this.busquedaMascota = '';
    this.mascotaSeleccionada = null;
    this.mascotasBusqueda = [];
    this.nuevaCita = { idServicio: '', fecha: '', hora: '08:00', motivo: '' };
    this.modalNuevaVisible = true;
  }

  getBadgeClass(estado: string): string {
    const map: any = { 'Pendiente': 'badge-warning', 'Completado': 'badge-success', 'Cancelado': 'badge-danger' };
    return 'badge ' + (map[estado] || 'badge-gray');
  }

  formatFechaReprog(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[d.getDay()]} ${d.getDate()}/${meses[d.getMonth()]}`;
  }

  verDetalle(cita: any) {
    this.citaSeleccionada = cita;
    this.modalDetalleVisible = true;
  }

  iniciarAtencion() {
    if (this.citaSeleccionada) {
      this.modalDetalleVisible = false;
      this.router.navigate(['/atencion', this.citaSeleccionada.idCitaProgramada]);
    }
  }

  abrirReprogramar(cita: any) {
    this.citaSeleccionada = cita;
    this.modalDetalleVisible = false;
    this.reprog = { fecha: '', hora: '', motivo: '' };
    this.modalReprogVisible = true;
  }

  cancelarCita(id: number) {
    Swal.fire({
      title: '¿Cancelar esta cita?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.citaService.getCita(id).subscribe({ next: (r: any) => {
        this.citaService.actualizarCita(id, { ...r.data, idEstadoCita: 3 }).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Cita cancelada', timer: 1500, showConfirmButton: false });
            this.cargarCitas();
            this.cargarStats();
          },
          error: () => Swal.fire({ icon: 'error', title: 'Error al cancelar' })
        });
      }});
    });
  }

  cancelarDesdeModal() {
    const id = this.citaSeleccionada?.idCitaProgramada;
    this.modalDetalleVisible = false;
    if (id) this.cancelarCita(id);
  }

  guardarReprogramacion() {
    if (!this.reprog.fecha || !this.reprog.hora) {
      Swal.fire({ icon: 'warning', title: 'Completa fecha y hora', timer: 1500, showConfirmButton: false });
      return;
    }
    const d = new Date(); const hoy = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (this.reprog.fecha < hoy) {
      Swal.fire({ icon: 'warning', title: 'Fecha inválida', text: 'No puedes reprogramar a una fecha pasada.' });
      return;
    }
    const id = this.citaSeleccionada?.idCitaProgramada;
    this.citaService.getCita(id).subscribe({ next: (r: any) => {
      this.citaService.actualizarCita(id, {
        ...r.data,
        fecha: this.reprog.fecha,
        horaInicio: this.reprog.hora + ':00',
        motivoReprogramacion: this.reprog.motivo
      }).subscribe({
        next: () => {
          this.modalReprogVisible = false;
          Swal.fire({ icon: 'success', title: 'Cita reprogramada', timer: 1500, showConfirmButton: false });
          this.cargarCitas();
        },
        error: () => Swal.fire({ icon: 'error', title: 'Error al reprogramar' })
      });
    }});
  }

  guardarCita() {
    if (!this.mascotaSeleccionada) {
      Swal.fire({ icon: 'warning', title: 'Selecciona una mascota', timer: 1500, showConfirmButton: false });
      return;
    }
    const { idServicio, fecha, hora, motivo } = this.nuevaCita;
    if (!idServicio || !fecha || !hora || !motivo) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos', timer: 1500, showConfirmButton: false });
      return;
    }
    const d = new Date(); const hoy = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (fecha < hoy) {
      Swal.fire({ icon: 'warning', title: 'Fecha inválida', text: 'No puedes registrar una cita en una fecha pasada.' });
      return;
    }
    this.citaService.crearCita({
      idDueno: this.mascotaSeleccionada.idDueno || 1,
      idProgramacion: 1,
      idMascota: this.mascotaSeleccionada.idMascota,
      fecha,
      horaInicio: hora + ':00',
      idEstadoCita: 1,
      motivo,
      idCategoria: 1,
      idServicio: +idServicio
    }).subscribe({
      next: () => {
        this.modalNuevaVisible = false;
        Swal.fire({ icon: 'success', title: 'Cita registrada', timer: 1500, showConfirmButton: false });
        this.cargarCitas();
        this.cargarStats();
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error al registrar cita' })
    });
  }

  get numeroInicio(): number {
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }
}
