import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/components/modal/modal';
import { Pagination } from '../../shared/components/pagination/pagination';
import { Badge } from '../../shared/components/badge/badge';
import { SearchBar } from '../../shared/components/search-bar/search-bar';
import { Router } from '@angular/router';
import { CitaService } from '../../services/citas/cita.service';
import { MascotaService } from '../../services/pacientes/mascota.service';
import Swal from 'sweetalert2';

// Página de Gestión de Citas
// Permite listar, filtrar, registrar, reprogramar y cancelar citas veterinarias
// Incluye estadísticas del mes y búsqueda en tiempo real de mascotas
@Component({
  selector: 'app-citas',
  imports: [CommonModule, FormsModule, Modal, Pagination, Badge, SearchBar],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class Citas implements OnInit {
  stats = { total: 0, pendientes: 0, completadas: 0, canceladas: 0 };
  citas: any[] = [];
  citasPaginadas: any[] = [];
  servicios: any[] = [];
  veterinarios: any[] = [];
  programacionesCita: any[] = [];
  horasDisponibles: string[] = [];
  horasDisponiblesReprog: string[] = [];

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
  nuevaCita = { idProgramacion: '', idServicio: '', fecha: '', hora: '', motivo: '' };
  reprog = { idProgramacion: '', fecha: '', hora: '', motivo: '' };

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
    this.citaService.getVeterinarios().subscribe({ next: (r: any) => { this.veterinarios = r.data || []; this.cdr.detectChanges(); } });
    this.citaService.getProgramacionesCita().subscribe({ next: (r: any) => { this.programacionesCita = r.data || []; this.cdr.detectChanges(); } });
  }

  // Veterinarios (programaciones) que coinciden con la fecha y el servicio elegidos.
  // Este es el select dinámico: solo aparecen los vets con programación ese día para ese servicio.
  get veterinariosFiltrados(): any[] {
    if (!this.nuevaCita.fecha || !this.nuevaCita.idServicio) return [];
    return this.programacionesCita.filter(p =>
      p.fecha === this.nuevaCita.fecha &&
      String(p.idServicio) === String(this.nuevaCita.idServicio)
    );
  }

  // Al cambiar fecha o servicio se reinicia el veterinario y la hora (cascada).
  onFechaServicioChange() {
    this.nuevaCita.idProgramacion = '';
    this.nuevaCita.hora = '';
    this.horasDisponibles = [];
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
    this.nuevaCita = { idProgramacion: '', idServicio: '', fecha: '', hora: '', motivo: '' };
    this.horasDisponibles = [];
    this.modalNuevaVisible = true;
  }

  // Genera franjas de 30 min dentro del turno del veterinario (ej. 08:00..12:30)
  private generarSlots(horaInicio: string, horaFin: string): string[] {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const pad = (n: number) => String(n).padStart(2, '0');
    const slots: string[] = [];
    for (let m = toMin(horaInicio); m < toMin(horaFin); m += 30) {
      slots.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    }
    return slots;
  }

  // Suma 30 min a una hora HH:mm (para calcular la hora de fin de la cita)
  private sumar30(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const total = h * 60 + m + 30;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
  }

  // Al cambiar el veterinario o la fecha, recalcula las horas seleccionables:
  // las del turno del vet menos las que ya están ocupadas ese día.
  onVetOrFechaChange() {
    const vet = this.programacionesCita.find(v => String(v.idProgramacion) === String(this.nuevaCita.idProgramacion));
    if (!vet || !this.nuevaCita.fecha) {
      this.horasDisponibles = [];
      this.nuevaCita.hora = '';
      return;
    }
    const slots = this.generarSlots(vet.horaInicio, vet.horaFin);
    this.citaService.getHorasOcupadas(vet.idProgramacion, this.nuevaCita.fecha).subscribe({
      next: (r: any) => {
        const ocupadas: string[] = r.data || [];
        this.horasDisponibles = slots.filter(s => !ocupadas.includes(s));
        if (!this.horasDisponibles.includes(this.nuevaCita.hora)) this.nuevaCita.hora = '';
        this.cdr.detectChanges();
      },
      error: () => { this.horasDisponibles = slots; this.cdr.detectChanges(); }
    });
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
    // Preselecciona el veterinario actual de la cita (por nombre) para mantener su turno
    const vet = this.veterinarios.find(v => v.nombreVeterinario?.trim() === cita.nombreVeterinario?.trim());
    this.reprog = { idProgramacion: vet ? String(vet.idProgramacion) : '', fecha: '', hora: '', motivo: '' };
    this.horasDisponiblesReprog = [];
    this.modalReprogVisible = true;
  }

  // Igual que en Nueva Cita, pero para el modal de Reprogramar: filtra las horas del turno
  // del vet elegido y excluye la propia cita del cálculo de ocupadas.
  onVetOrFechaChangeReprog() {
    const vet = this.veterinarios.find(v => String(v.idProgramacion) === String(this.reprog.idProgramacion));
    if (!vet || !this.reprog.fecha) {
      this.horasDisponiblesReprog = [];
      this.reprog.hora = '';
      return;
    }
    const slots = this.generarSlots(vet.horaInicio, vet.horaFin);
    const idExcluir = this.citaSeleccionada?.idCitaProgramada;
    this.citaService.getHorasOcupadas(vet.idProgramacion, this.reprog.fecha, idExcluir).subscribe({
      next: (r: any) => {
        const ocupadas: string[] = r.data || [];
        this.horasDisponiblesReprog = slots.filter(s => !ocupadas.includes(s));
        if (!this.horasDisponiblesReprog.includes(this.reprog.hora)) this.reprog.hora = '';
        this.cdr.detectChanges();
      },
      error: () => { this.horasDisponiblesReprog = slots; this.cdr.detectChanges(); }
    });
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
    if (!this.reprog.idProgramacion || !this.reprog.fecha || !this.reprog.hora) {
      Swal.fire({ icon: 'warning', title: 'Completa veterinario, fecha y hora', timer: 1800, showConfirmButton: false });
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
        idProgramacion: +this.reprog.idProgramacion,
        fecha: this.reprog.fecha,
        horaInicio: this.reprog.hora + ':00',
        horaFin: this.sumar30(this.reprog.hora) + ':00',
        motivoReprogramacion: this.reprog.motivo
      }).subscribe({
        next: () => {
          this.modalReprogVisible = false;
          Swal.fire({ icon: 'success', title: 'Cita reprogramada', timer: 1500, showConfirmButton: false });
          this.cargarCitas();
        },
        error: (err: any) => {
          const msg = err?.error?.error || err?.error?.message;
          Swal.fire({ icon: 'error', title: 'Error al reprogramar', text: msg || 'Intenta nuevamente.' });
        }
      });
    }});
  }

  guardarCita() {
    if (!this.mascotaSeleccionada) {
      Swal.fire({ icon: 'warning', title: 'Selecciona una mascota', timer: 1500, showConfirmButton: false });
      return;
    }
    const { idProgramacion, idServicio, fecha, hora, motivo } = this.nuevaCita;
    if (!idProgramacion || !idServicio || !fecha || !hora || !motivo) {
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
      idProgramacion: +idProgramacion,
      idMascota: this.mascotaSeleccionada.idMascota,
      fecha,
      horaInicio: hora + ':00',
      horaFin: this.sumar30(hora) + ':00',
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
      error: (err: any) => {
        const msg = err?.error?.error || err?.error?.message;
        Swal.fire({ icon: 'error', title: 'Error al registrar cita', text: msg || 'Intenta nuevamente.' });
      }
    });
  }

  get numeroInicio(): number {
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }
}
