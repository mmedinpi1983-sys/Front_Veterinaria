import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MascotaService } from '../../services/mascota.service';
import { PacienteService } from '../../services/paciente.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

const API = 'http://localhost:8080';

// Página de Gestión de Pacientes
// Lista mascotas con sus propietarios. Permite registrar (crea Dueño + Mascota + vínculo),
// editar y eliminar pacientes. Protege el eliminado si hay citas pendientes.
@Component({
  selector: 'app-pacientes',
  imports: [CommonModule, FormsModule],
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

  // Datos de EspecieRaza cargados desde la BD
  especiesRazas: any[] = [];
  especies: any[] = [];       // Registros con idEspecie = null (Perro, Gato, etc.)
  razasFiltradas: any[] = []; // Razas de la especie seleccionada

  // Autocomplete de raza
  razaInput = '';             // Texto escrito por el usuario
  mostrarRazas = false;       // Controla visibilidad del dropdown de razas
  razaTimeout: any;

  nuevo = {
    nombre: '', idEspecie: null as any, idRaza: null as any,
    sexo: '', tamanio: '', edad: '', notas: '',
    nombreDueno: '', apellidoPaternoDueno: '', apellidoMaternoDueno: '', dni: '', email: '', telefono: ''
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
    // Carga todas las especies y razas de la tabla EspecieRaza (tabla autoreferida)
    this.pacienteService.getEspeciesRazas().subscribe({ next: (r: any) => {
      this.especiesRazas = r.data || [];
      // Los registros sin idEspecie son las especies principales
      this.especies = this.especiesRazas.filter((e: any) => !e.idEspecie);
      this.cdr.detectChanges();
    }});
  }

  // Al cambiar especie: filtra las razas que pertenecen a esa especie
  onEspecieChange() {
    this.nuevo.idRaza = null;
    this.razaInput = '';
    if (this.nuevo.idEspecie) {
      this.razasFiltradas = this.especiesRazas.filter(
        (e: any) => e.idEspecie === this.nuevo.idEspecie
      );
    } else {
      this.razasFiltradas = [];
    }
  }

  // Filtra las razas según lo que el usuario escribe
  onRazaInput() {
    this.nuevo.idRaza = null;
    this.mostrarRazas = true;
    if (!this.razaInput.trim()) {
      this.razasFiltradas = this.especiesRazas.filter(
        (e: any) => e.idEspecie === this.nuevo.idEspecie
      );
    } else {
      this.razasFiltradas = this.especiesRazas.filter(
        (e: any) => e.idEspecie === this.nuevo.idEspecie &&
        e.nombre.toLowerCase().includes(this.razaInput.toLowerCase())
      );
    }
  }

  // Al seleccionar una raza del autocomplete
  seleccionarRaza(r: any) {
    this.nuevo.idRaza = r.idEspecieRaza;
    this.razaInput = r.nombre;
    this.mostrarRazas = false;
  }

  cerrarRazas() {
    setTimeout(() => { this.mostrarRazas = false; }, 200);
  }

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
    this.nuevo = { nombre: '', idEspecie: null, idRaza: null, sexo: '', tamanio: '', edad: '', notas: '', nombreDueno: '', apellidoPaternoDueno: '', apellidoMaternoDueno: '', dni: '', email: '', telefono: '' };
    this.razaInput = '';
    this.razasFiltradas = [];
    this.mostrarRazas = false;
    this.modalNuevoVisible = true;
  }

  abrirEditar(p: any) {
    this.editando = {
      idMascota: p.idMascota, nombre: p.nombre, especie: p.especie || '',
      raza: p.raza || '', sexo: p.sexo || '', tamanio: p.tamanio || '', notas: '',
      idDueno: p.idDueno, nombreDueno: '', apellidoPaternoDueno: '', apellidoMaternoDueno: '', dni: '', email: '', telefono: ''
    };
    if (p.idDueno) {
      this.pacienteService.getDueno(p.idDueno).subscribe({ next: (r: any) => {
        const d = r.data;
        this.editando.nombreDueno = d.nombre || '';
        this.editando.apellidoPaternoDueno = d.apellidoPaterno || '';
        this.editando.apellidoMaternoDueno = d.apellidoMaterno || '';
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
    if (!this.nuevo.nombre || !this.nuevo.idEspecie || !this.nuevo.nombreDueno || !this.nuevo.apellidoPaternoDueno || !this.nuevo.apellidoMaternoDueno || !this.nuevo.dni || !this.nuevo.telefono) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos obligatorios (*)', timer: 2000, showConfirmButton: false });
      return;
    }
    try {
      const duenoRes: any = await lastValueFrom(this.pacienteService.crearDueno({
        idDocumentoIdentidad: 1, idAsociado: 1,
        nombre: this.nuevo.nombreDueno,
        apellidoPaterno: this.nuevo.apellidoPaternoDueno,
        apellidoMaterno: this.nuevo.apellidoMaternoDueno,
        nroDocumento: this.nuevo.dni,
        nroTelefono: this.nuevo.telefono || null,
        correoElectronico: this.nuevo.email || null,
        estado: true
      }));

      const mascotaRes: any = await lastValueFrom(this.mascotaService.crearMascota({
        nombre: this.nuevo.nombre,
        idEspecie: this.nuevo.idEspecie ? +this.nuevo.idEspecie : null,
        idRaza: this.nuevo.idRaza ? +this.nuevo.idRaza : null,
        idAsociado: 1, estado: true,
        sexo: this.nuevo.sexo || null,
        tamanio: this.nuevo.tamanio || null,
        notas: this.nuevo.notas || null,
        fechaNacimiento: null
      }));

      await lastValueFrom(this.pacienteService.vincularDuenoMascota(
        duenoRes.data.idDueno, mascotaRes.data.idMascota
      ));

      this.modalNuevoVisible = false;
      Swal.fire({ icon: 'success', title: 'Paciente registrado', timer: 1500, showConfirmButton: false });
      this.cargarPacientes();
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'No se pudo registrar', html: this.extraerMensajeError(e, 'Error al registrar paciente') });
    }
  }

  // Extrae el mensaje real que envia el backend (validaciones por campo o ApiException).
  // Devuelve HTML: una lista con vinetas si hay varios errores, o el texto si es uno solo.
  private extraerMensajeError(e: any, generico: string): string {
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
  }

  async guardarEdicion() {
    if (!this.editando?.nombre || !this.editando?.nombreDueno || !this.editando?.apellidoPaternoDueno || !this.editando?.apellidoMaternoDueno || !this.editando?.dni || !this.editando?.telefono) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos obligatorios (*)', timer: 2000, showConfirmButton: false });
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
          apellidoPaterno: this.editando.apellidoPaternoDueno,
          apellidoMaterno: this.editando.apellidoMaternoDueno,
          nroDocumento: this.editando.dni || duenoRaw.data.nroDocumento,
          correoElectronico: this.editando.email || null,
          nroTelefono: this.editando.telefono || null
        }));
      }

      this.modalEditarVisible = false;
      Swal.fire({ icon: 'success', title: 'Paciente actualizado', timer: 1500, showConfirmButton: false });
      this.cargarPacientes();
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'No se pudo actualizar', html: this.extraerMensajeError(e, 'Error al actualizar') });
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
