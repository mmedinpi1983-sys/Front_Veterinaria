import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tabs } from '../../shared/components/tabs/tabs';
import { lastValueFrom } from 'rxjs';
import { AtencionService } from '../../services/atencion/atencion.service';

@Component({
  selector: 'app-atencion',
  imports: [CommonModule, FormsModule, Tabs],
  templateUrl: './atencion.html',
  styleUrl: './atencion.css'
})
export class Atencion implements OnInit {
  idCita = 0;
  // 'iniciar' (default, comportamiento de siempre) | 'ver' (solo lectura) | 'editar' (precarga y guarda sobre lo existente)
  modo: 'iniciar' | 'ver' | 'editar' = 'iniciar';
  get soloLectura(): boolean { return this.modo === 'ver'; }
  tabActivo = 'triaje';
  tabs = [{ id: 'triaje', label: 'Triaje' }, { id: 'anamnesis', label: 'Anamnesis' }, { id: 'consulta', label: 'Consulta' }, { id: 'receta', label: 'Receta' }];
  cita: any = null;
  medicamentos: any[] = [];
  medicamentosReceta: any[] = [];
  toast = { visible: false, msg: '', type: 'success' };
  loading = false;

  // Vista previa de receta (modal tipo documento imprimible)
  modalPreviaReceta = false;
  clinica = { nombre: 'Clínica Veterinaria Vetclinic', direccion: 'Av. Primavera 123, Lima', telefono: '987 654 321' };

  state = {
    idTriaje: null as any, idTriajeDetalle: null as any, idAtencion: null as any,
    idConsulta: null as any, idAnamnesis: null as any, idReceta: null as any, idMascota: null as any
  };
  anamnesisGuardada: any = null;
  // Ids de RecetaDetalle ya guardados al precargar (modo editar), para poder reemplazarlos al guardar
  private recetaDetalleIdsOriginales: number[] = [];

  triaje = { prioridad: '1', metodo: '1', temperatura: '', peso: '', alergias: '', observaciones: '' };
  anamnesis = { antecedentes: '', alergias: '0', cirugias: '0', medicamentos: '', vacunas: '', alimentacion: '', comportamiento: '', inicioSintomas: '', evolucionSintomas: '', observaciones: '' };
  consulta = { diagnostico: '', tratamiento: '', observaciones: '', requiereControl: true, fechaControl: '' };
  recetaForm = { idMedicamento: '', dosis: '', frecuencia: '', duracion: '', instrucciones: '', via: '1' };
  viasAdmin = [
    { id: 1, nombre: 'Oral' }, { id: 2, nombre: 'Inyectable' }, { id: 3, nombre: 'Tópica' },
    { id: 4, nombre: 'Subcutánea' }, { id: 5, nombre: 'Intravenosa' }, { id: 6, nombre: 'Oftálmica' },
    { id: 7, nombre: 'Ótica' }
  ];

  constructor(private route: ActivatedRoute, public router: Router, private api: AtencionService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.idCita = +this.route.snapshot.paramMap.get('idCita')!;
    const modoParam = this.route.snapshot.queryParamMap.get('modo');
    this.modo = modoParam === 'ver' || modoParam === 'editar' ? modoParam : 'iniciar';
    this.cargarCita();
    this.cargarMedicamentos();
  }

  cargarCita() {
    this.api.getCita(this.idCita).subscribe({ next: (r: any) => {
      this.state.idMascota = r.data?.idMascota || 1;
    }});
    this.api.getCitasEnriquecidas().subscribe({ next: (r: any) => {
      this.cita = (r.data || []).find((c: any) => c.idCitaProgramada === this.idCita);
      this.cdr.detectChanges();
    }});
    this.api.getAtencionPorCita(this.idCita).subscribe({
      next: (r: any) => {
        if (r.success && r.data) {
          this.state.idAtencion = r.data.idAtencion;
          if (this.modo !== 'iniciar') this.cargarDetalleExistente(this.state.idAtencion);
        }
      },
      error: () => {}
    });
  }

  // Precarga triaje/anamnesis/consulta/receta ya guardados (modos "ver" y "editar")
  cargarDetalleExistente(idAtencion: number) {
    this.api.getAtencionDetalle(idAtencion).subscribe({ next: (r: any) => {
      const d = r.data;
      if (!d) return;

      if (d.triaje) {
        this.state.idTriaje = d.triaje.idTriaje;
        this.state.idTriajeDetalle = d.triaje.idTriajeDetalle;
        this.triaje = {
          prioridad: String(d.triaje.prioridad ?? '1'),
          metodo: String(d.triaje.idMetodoIngreso ?? '1'),
          temperatura: d.triaje.temperatura != null ? String(d.triaje.temperatura) : '',
          peso: d.triaje.peso != null ? String(d.triaje.peso) : '',
          alergias: d.triaje.alergias || '',
          observaciones: d.triaje.observaciones || ''
        };
      }

      if (d.anamnesis) {
        this.state.idAnamnesis = d.anamnesis.idAnamnesis;
        this.anamnesis = {
          antecedentes: d.anamnesis.antecedentes || '',
          alergias: String(d.anamnesis.alergias ?? '0'),
          cirugias: String(d.anamnesis.cirugiasAnteriores ?? '0'),
          medicamentos: d.anamnesis.medicamentosActuales || '',
          vacunas: d.anamnesis.historialVacunacion || '',
          alimentacion: d.anamnesis.alimentacion || '',
          comportamiento: d.anamnesis.comportamiento || '',
          inicioSintomas: d.anamnesis.inicioSintomas || '',
          evolucionSintomas: d.anamnesis.evolucionSintomas || '',
          observaciones: d.anamnesis.observaciones || ''
        };
        this.anamnesisGuardada = { ...d.anamnesis };
      }

      if (d.consulta) {
        this.state.idConsulta = d.consulta.idConsulta;
        this.consulta = {
          diagnostico: d.consulta.evaluacionClinica || '',
          tratamiento: d.consulta.tratamiento || '',
          observaciones: d.consulta.observaciones || '',
          requiereControl: !!d.consulta.requiereControl,
          fechaControl: d.consulta.fechaProximoControl || ''
        };
      }

      if (d.receta) {
        this.state.idReceta = d.receta.idReceta;
        this.recetaDetalleIdsOriginales = (d.receta.detalle || []).map((m: any) => m.idRecetaDetalle);
        this.medicamentosReceta = (d.receta.detalle || []).map((m: any) => {
          const med = this.medicamentos.find(x => x.idMedicamento === m.idMedicamento);
          const via = this.viasAdmin.find(v => v.id === m.viaAdministracion);
          return {
            idRecetaDetalle: m.idRecetaDetalle,
            idMedicamento: m.idMedicamento,
            nombre: med?.nombreMedicamento || '',
            dosis: m.dosis, frecuencia: m.frecuencia, duracion: m.duracion,
            indicacionesEspecificas: m.indicacionesEspecificas,
            via: via?.nombre || 'Oral', viaAdministracion: m.viaAdministracion
          };
        });
      }
      this.cdr.detectChanges();
    }});
  }

  cargarMedicamentos() {
    this.api.getMedicamentos().subscribe({ next: (r: any) => {
      this.medicamentos = r.data || [];
      // Si el detalle precargado (modo ver/editar) llegó antes que el catálogo, completa los nombres pendientes
      for (const m of this.medicamentosReceta) {
        if (!m.nombre) m.nombre = this.medicamentos.find(x => x.idMedicamento === m.idMedicamento)?.nombreMedicamento || '';
      }
      this.cdr.detectChanges();
    }});
  }

  showTab(tab: string) { this.tabActivo = tab; }

  async submitTriaje() {
    if (this.soloLectura) { this.showTab('anamnesis'); return; }
    this.loading = true;
    try {
      if (this.modo === 'editar' && this.state.idTriaje) {
        await lastValueFrom(this.api.actualizarTriaje(this.state.idTriaje, {
          idCitaProgramada: this.idCita,
          codigoTemporal: `TRI-${new Date().getFullYear()}-${String(this.idCita).padStart(3,'0')}`,
          idMascota: this.state.idMascota, prioridad: +this.triaje.prioridad,
          estado: true, idMetodoIngreso: +this.triaje.metodo
        }));
        const detalleBody = {
          temperatura: this.triaje.temperatura ? +this.triaje.temperatura : null,
          peso: this.triaje.peso ? +this.triaje.peso : null,
          alergias: this.triaje.alergias || null,
          observaciones: this.triaje.observaciones || null
        };
        if (this.state.idTriajeDetalle) {
          await lastValueFrom(this.api.actualizarTriajeDetalle(this.state.idTriajeDetalle, detalleBody));
        } else {
          await lastValueFrom(this.api.crearTriajeDetalle({ ...detalleBody, idTriaje: this.state.idTriaje }));
        }
        this.showToast('Triaje actualizado');
        this.showTab('anamnesis');
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      const tr: any = await lastValueFrom(this.api.crearTriaje({
        idCitaProgramada: this.idCita,
        codigoTemporal: `TRI-${new Date().getFullYear()}-${String(this.idCita).padStart(3,'0')}`,
        idMascota: this.state.idMascota, prioridad: +this.triaje.prioridad,
        estado: true, idAsociado: 1, idMetodoIngreso: +this.triaje.metodo
      }));
      this.state.idTriaje = tr.data.idTriaje;

      await lastValueFrom(this.api.crearTriajeDetalle({
        idTriaje: this.state.idTriaje,
        temperatura: this.triaje.temperatura ? +this.triaje.temperatura : null,
        peso: this.triaje.peso ? +this.triaje.peso : null,
        alergias: this.triaje.alergias || null,
        observaciones: this.triaje.observaciones || null
      }));

      if (!this.state.idAtencion) {
        const ar: any = await lastValueFrom(this.api.crearAtencion({
          idCitaProgramada: this.idCita, idTriaje: this.state.idTriaje, idAsociado: 1,
          fechaAtencion: new Date().toISOString().split('T')[0],
          horaInicio: new Date().toTimeString().substring(0,8),
          observacion: this.triaje.observaciones || 'Atención iniciada',
          idEstadoSalida: 1, idEstadoAtencion: 1, idMascota: this.state.idMascota
        }));
        this.state.idAtencion = ar.data.idAtencion;
      }

      this.showToast('Triaje registrado');
      this.showTab('anamnesis');
    } catch(e) { this.showToast('Error al registrar triaje', 'error'); console.error(e); }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }

  guardarAnamnesis() {
    if (this.soloLectura) { this.showTab('consulta'); return; }
    this.anamnesisGuardada = {
      antecedentes: this.anamnesis.antecedentes || 'Sin antecedentes',
      alergias: +this.anamnesis.alergias,
      cirugiasAnteriores: +this.anamnesis.cirugias,
      medicamentosActuales: this.anamnesis.medicamentos || 'Ninguno',
      historialVacunacion: this.anamnesis.vacunas || null,
      alimentacion: this.anamnesis.alimentacion || null,
      comportamiento: this.anamnesis.comportamiento || null,
      historialReproductivo: 0,
      inicioSintomas: this.anamnesis.inicioSintomas || 'N/A',
      evolucionSintomas: this.anamnesis.evolucionSintomas || 'N/A',
      observaciones: this.anamnesis.observaciones || null
    };
    this.showToast('Anamnesis guardada');
    this.showTab('consulta');
  }

  async submitConsulta() {
    if (this.soloLectura) { this.showTab('receta'); return; }
    if (!this.consulta.diagnostico) { this.showToast('El diagnóstico es obligatorio', 'error'); return; }
    this.loading = true;
    try {
      const consultaBody = {
        idAtencion: this.state.idAtencion,
        motivoConsulta: 'Consulta médica',
        evaluacionClinica: this.consulta.diagnostico,
        tratamiento: this.consulta.tratamiento || '--',
        indicaciones: this.consulta.observaciones || '--',
        observaciones: this.consulta.observaciones || '--',
        requiereControl: this.consulta.requiereControl,
        fechaProximoControl: this.consulta.fechaControl || null
      };

      if (this.modo === 'editar' && this.state.idConsulta) {
        await lastValueFrom(this.api.actualizarAtencionConsulta(this.state.idConsulta, consultaBody));
      } else {
        const cr: any = await lastValueFrom(this.api.crearAtencionConsulta(consultaBody));
        this.state.idConsulta = cr.data.idConsulta;
      }

      if (this.anamnesisGuardada) {
        if (this.modo === 'editar' && this.state.idAnamnesis) {
          await lastValueFrom(this.api.actualizarAnamnesis(this.state.idAnamnesis, { ...this.anamnesisGuardada, idConsulta: this.state.idConsulta }));
        } else {
          await lastValueFrom(this.api.crearAnamnesis({ ...this.anamnesisGuardada, idConsulta: this.state.idConsulta }));
        }
      }

      this.showToast('Consulta guardada');
      this.showTab('receta');
    } catch(e) { this.showToast('Error al guardar consulta', 'error'); console.error(e); }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }

  agregarMedicamento() {
    if (this.soloLectura) return;
    if (!this.recetaForm.idMedicamento) { this.showToast('Selecciona un medicamento', 'error'); return; }
    const med = this.medicamentos.find(m => m.idMedicamento === +this.recetaForm.idMedicamento);
    const via = this.viasAdmin.find(v => v.id === +this.recetaForm.via);
    this.medicamentosReceta.push({
      idMedicamento: +this.recetaForm.idMedicamento,
      nombre: med?.nombreMedicamento || '',
      dosis: this.recetaForm.dosis,
      frecuencia: this.recetaForm.frecuencia,
      duracion: this.recetaForm.duracion,
      indicacionesEspecificas: this.recetaForm.instrucciones,
      via: via?.nombre || 'Oral',
      viaAdministracion: +this.recetaForm.via
    });
    this.recetaForm = { idMedicamento: '', dosis: '', frecuencia: '', duracion: '', instrucciones: '', via: '1' };
    this.showToast('Medicamento agregado');
    this.cdr.detectChanges();
  }

  quitarMedicamento(i: number) {
    if (this.soloLectura) return;
    this.medicamentosReceta.splice(i, 1);
    this.cdr.detectChanges();
  }

  async guardarReceta() {
    if (this.soloLectura) { this.router.navigate(['/atencion']); return; }
    if (!this.medicamentosReceta.length) { this.showToast('Agrega al menos un medicamento', 'error'); return; }
    if (!this.state.idConsulta) { this.showToast('Primero completa la Consulta', 'error'); return; }
    this.loading = true;
    try {
      let idReceta: number;
      if (this.modo === 'editar' && this.state.idReceta) {
        idReceta = this.state.idReceta;
        // Guardado DIFERENCIAL: no se reemplaza toda la receta.
        // Solo se elimina lo que el usuario quitó y se crea lo que agregó; lo que sigue igual no se toca.
        const idsActuales = this.medicamentosReceta
          .filter(m => m.idRecetaDetalle)
          .map(m => m.idRecetaDetalle);
        const eliminados = this.recetaDetalleIdsOriginales.filter(id => !idsActuales.includes(id));
        for (const idDetalle of eliminados) {
          await lastValueFrom(this.api.eliminarRecetaDetalle(idDetalle));
        }
        const agregados = this.medicamentosReceta.filter(m => !m.idRecetaDetalle);
        for (const med of agregados) {
          await lastValueFrom(this.api.crearRecetaDetalle(this.bodyDetalle(med, idReceta)));
        }
        this.recetaDetalleIdsOriginales = idsActuales;
      } else {
        const rr: any = await lastValueFrom(this.api.crearReceta({
          idConsulta: this.state.idConsulta,
          fechaReceta: new Date().toISOString(),
          idEmpleadoAsociado: 1, idAsociado: 1
        }));
        idReceta = rr.data.idReceta;
        for (const med of this.medicamentosReceta) {
          await lastValueFrom(this.api.crearRecetaDetalle(this.bodyDetalle(med, idReceta)));
        }
      }

      const citaRaw: any = await lastValueFrom(this.api.getCita(this.idCita));
      await lastValueFrom(this.api.actualizarCita(this.idCita, { ...citaRaw.data, idEstadoCita: 2 }));

      this.showToast(this.modo === 'editar' ? 'Atención actualizada' : '¡Atención clínica completada!');
      setTimeout(() => this.router.navigate(['/atencion']), 2000);
    } catch(e) { this.showToast('Error al guardar receta', 'error'); console.error(e); }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }

  // Arma el cuerpo exacto que espera RecetaDetalleCreateRequest, sin campos de solo-vista
  // (idRecetaDetalle, nombre, via) que hacían fallar el guardado.
  private bodyDetalle(med: any, idReceta: number): any {
    return {
      idReceta,
      idMedicamento: med.idMedicamento,
      dosis: med.dosis,
      frecuencia: med.frecuencia,
      duracion: med.duracion,
      viaAdministracion: med.viaAdministracion,
      indicacionesEspecificas: med.indicacionesEspecificas
    };
  }

  showToast(msg: string, type = 'success') {
    this.toast = { visible: true, msg, type };
    this.cdr.detectChanges();
    setTimeout(() => { this.toast.visible = false; this.cdr.detectChanges(); }, 3000);
  }

  getCodigo() { return `ATC-${String(this.idCita).padStart(4,'0')}`; }

  // Fecha de hoy en formato dd/mm/aaaa para la receta
  get fechaReceta(): string {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  // Abre la vista previa de la receta (requiere al menos un medicamento)
  vistaPreviaReceta() {
    if (!this.medicamentosReceta.length) { this.showToast('Agrega al menos un medicamento', 'error'); return; }
    this.modalPreviaReceta = true;
    this.cdr.detectChanges();
  }

  cerrarPreviaReceta() { this.modalPreviaReceta = false; this.cdr.detectChanges(); }

  // Imprime / guarda como PDF la receta. El CSS @media print aísla solo el documento.
  imprimirReceta() { window.print(); }
}
