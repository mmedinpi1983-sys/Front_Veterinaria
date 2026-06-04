import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MascotaService } from '../../services/mascota.service';
import { PacienteService } from '../../services/paciente.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

const API = 'http://localhost:8080';

@Component({
  selector: 'app-pacientes',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes implements OnInit {
  pacientes: any[] = [];
  pacientesPaginados: any[] = [];

  busqueda = '';
  filtroEspecie = '';
  busquedaTimeout: any;

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  modalNuevoVisible = false;
  modalEditarVisible = false;

  especiesRazas: any[] = [];
  especies: any[] = [];
  razasFiltradas: any[] = [];
  especieSeleccionada: number | null = null;

  nuevo = {
    nombre: '', especie: '', raza: '',
    sexo: '', tamanio: '', edad: '', notas: '',
    nombreDueno: '', apellidoDueno: '', dni: '', email: '', telefono: ''
  };

  editando: any = null;

  constructor(
    private mascotaService: MascotaService,
    private pacienteService: PacienteService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPacientes();
    this.pacienteService.getEspeciesRazas().subscribe({ next: (r: any) => {
      this.especiesRazas = r.data || [];
      this.especies = this.especiesRazas.filter((e: any) => !e.especie);
      this.cdr.detectChanges();
    }});
  }

  onEspecieChange() {}

  cargarPacientes() {
    this.mascotaService.buscar(this.busqueda || '').subscribe({ next: (r: any) => {
      let data = r.data || [];
      if (this.filtroEspecie) data = data.filter((p: any) => p.especie === this.filtroEspecie);
      this.pacientes = data;
      this.paginaActual = 1;
      this.actualizarPaginacion();
      this.cdr.detectChanges();
    }});
  }

  onBusqueda() {
    clearTimeout(this.busquedaTimeout);
    this.busquedaTimeout = setTimeout(() => this.cargarPacientes(), 400);
  }

  actualizarPaginacion() {
    this.totalPaginas = Math.max(1, Math.ceil(this.pacientes.length / this.itemsPorPagina));
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.pacientesPaginados = this.pacientes.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.actualizarPaginacion();
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get numeroInicio(): number {
    return (this.paginaActual - 1) * this.itemsPorPagina + 1;
  }

  abrirNuevo() {
    this.nuevo = { nombre: '', especie: '', raza: '', sexo: '', tamanio: '', edad: '', notas: '', nombreDueno: '', apellidoDueno: '', dni: '', email: '', telefono: '' };
    this.razasFiltradas = [];
    this.modalNuevoVisible = true;
  }

  abrirEditar(p: any) {
    this.editando = {
      idMascota: p.idMascota, nombre: p.nombre, especie: p.especie || '',
      raza: p.raza || '', sexo: p.sexo || '', tamanio: p.tamanio || '', notas: '',
      idDueno: p.idDueno, nombreDueno: '', apellidoDueno: '', dni: '', email: '', telefono: ''
    };
    if (p.idDueno) {
      this.pacienteService.getDueno(p.idDueno).subscribe({ next: (r: any) => {
        const d = r.data;
        this.editando.nombreDueno = d.nombre || '';
        this.editando.apellidoDueno = d.apellidoPaterno || '';
        this.editando.dni = d.nroDocumento || '';
        this.editando.email = d.correoElectronico || '';
        this.editando.telefono = d.nroTelefono || '';
        this.cdr.detectChanges();
      }});
    }
    this.mascotaService.getMascota(p.idMascota).subscribe({ next: (r: any) => {
      this.editando.notas = r.data.notas || '';
      this.cdr.detectChanges();
    }});
    this.modalEditarVisible = true;
  }

  async guardarNuevo() {
    if (!this.nuevo.nombre || !this.nuevo.especie || !this.nuevo.nombreDueno || !this.nuevo.dni || !this.nuevo.telefono) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos obligatorios (*)', timer: 2000, showConfirmButton: false });
      return;
    }
    try {
      const partes = this.nuevo.nombreDueno.trim().split(' ');
      const nombreD = partes[0];
      const apellidoD = partes.length > 1 ? partes[1] : '-';
      const apellidoM = partes.length > 2 ? partes.slice(2).join(' ') : '-';
      const duenoRes: any = await lastValueFrom(this.pacienteService.crearDueno({
        idDocumentoIdentidad: 1, idAsociado: 1,
        nombre: nombreD,
        apellidoPaterno: apellidoD,
        apellidoMaterno: apellidoM,
        nroDocumento: this.nuevo.dni,
        nroTelefono: this.nuevo.telefono || null,
        correoElectronico: this.nuevo.email || null,
        estado: true
      }));

      const mascotaRes: any = await lastValueFrom(this.mascotaService.crearMascota({
        nombre: this.nuevo.nombre,
        idEspecie: null, idRaza: null,
        idAsociado: 1, estado: true,
        sexo: this.nuevo.sexo || null,
        tamanio: this.nuevo.tamanio || null,
        notas: this.nuevo.notas || null,
        fechaNacimiento: null,
        especieTexto: this.nuevo.especie || null,
        razaTexto: this.nuevo.raza || null
      }));

      await lastValueFrom(this.pacienteService.vincularDuenoMascota(
        duenoRes.data.idDueno, mascotaRes.data.idMascota
      ));

      this.modalNuevoVisible = false;
      Swal.fire({ icon: 'success', title: 'Paciente registrado', timer: 1500, showConfirmButton: false });
      this.cargarPacientes();
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'Error al registrar paciente' });
    }
  }

  async guardarEdicion() {
    if (!this.editando?.nombre) {
      Swal.fire({ icon: 'warning', title: 'El nombre es requerido', timer: 1500, showConfirmButton: false });
      return;
    }
    try {
      const mascotaRaw: any = await lastValueFrom(this.mascotaService.getMascota(this.editando.idMascota));
      await lastValueFrom(this.mascotaService.actualizarMascota(this.editando.idMascota, {
        ...mascotaRaw.data,
        nombre: this.editando.nombre,
        sexo: this.editando.sexo || null,
        tamanio: this.editando.tamanio || null,
        notas: this.editando.notas || null
      }));

      if (this.editando.idDueno) {
        const duenoRaw: any = await lastValueFrom(this.pacienteService.getDueno(this.editando.idDueno));
        await lastValueFrom(this.pacienteService.actualizarDueno(this.editando.idDueno, {
          ...duenoRaw.data,
          nombre: this.editando.nombreDueno,
          apellidoPaterno: this.editando.apellidoDueno || duenoRaw.data.apellidoPaterno,
          nroDocumento: this.editando.dni || duenoRaw.data.nroDocumento,
          correoElectronico: this.editando.email || null,
          nroTelefono: this.editando.telefono || null
        }));
      }

      this.modalEditarVisible = false;
      Swal.fire({ icon: 'success', title: 'Paciente actualizado', timer: 1500, showConfirmButton: false });
      this.cargarPacientes();
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'Error al actualizar' });
    }
  }

  verHistorial(p: any) {
    this.router.navigate(['/historia-clinica', p.idMascota]);
  }

  eliminar(id: number) {
    this.http.get<any>(`${API}/api/citaprogramada/por-mascota/${id}`).subscribe({ next: (r: any) => {
      const citasPendientes = (r.data || []).filter((c: any) => c.estadoCita === 'Pendiente');
      if (citasPendientes.length > 0) {
        Swal.fire({ icon: 'warning', title: 'No se puede eliminar', text: `Este paciente tiene ${citasPendientes.length} cita(s) pendiente(s). Cancélalas primero.` });
        return;
      }
      Swal.fire({
        title: '¿Eliminar paciente?', text: 'Esta acción no se puede deshacer.',
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#DC2626', cancelButtonColor: '#64748B',
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
      }).then(result => {
        if (!result.isConfirmed) return;
        this.mascotaService.eliminarMascota(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Paciente eliminado', timer: 1500, showConfirmButton: false });
            this.cargarPacientes();
          },
          error: () => Swal.fire({ icon: 'error', title: 'Error al eliminar' })
        });
      });
    }});
  }

  getBadgeTamanio(t: string): string {
    const map: any = { 'Grande': 'badge-navy', 'Mediano': 'badge-accent', 'Pequeño': 'badge-gray' };
    return 'badge ' + (map[t] || 'badge-gray');
  }
}
