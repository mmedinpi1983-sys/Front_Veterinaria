import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Tabs } from '../../shared/components/tabs/tabs';
import { lastValueFrom } from 'rxjs';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-atencion',
  imports: [CommonModule, FormsModule, Tabs],
  templateUrl: './atencion.html',
  styleUrl: './atencion.css'
})
export class Atencion implements OnInit {
  idCita = 0;
  tabActivo = 'triaje';
  tabs = [{ id: 'triaje', label: 'Triaje' }, { id: 'anamnesis', label: 'Anamnesis' }, { id: 'consulta', label: 'Consulta' }, { id: 'receta', label: 'Receta' }];
  cita: any = null;
  medicamentos: any[] = [];
  medicamentosReceta: any[] = [];
  toast = { visible: false, msg: '', type: 'success' };
  loading = false;

  state = { idTriaje: null as any, idAtencion: null as any, idConsulta: null as any, idMascota: null as any };
  anamnesisGuardada: any = null;

  triaje = { prioridad: '1', metodo: '1', temperatura: '', peso: '', alergias: '', observaciones: '' };
  anamnesis = { antecedentes: '', alergias: '0', cirugias: '0', medicamentos: '', vacunas: '', alimentacion: '', comportamiento: '', inicioSintomas: '', evolucionSintomas: '', observaciones: '' };
  consulta = { diagnostico: '', tratamiento: '', observaciones: '', requiereControl: true, fechaControl: '' };
  recetaForm = { idMedicamento: '', dosis: '', frecuencia: '', duracion: '', instrucciones: '' };

  constructor(private route: ActivatedRoute, public router: Router, private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.idCita = +this.route.snapshot.paramMap.get('idCita')!;
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
      next: (r: any) => { if (r.success && r.data) this.state.idAtencion = r.data.idAtencion; },
      error: () => {}
    });
  }

  cargarMedicamentos() {
    this.api.getMedicamentos().subscribe({ next: (r: any) => {
      this.medicamentos = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  showTab(tab: string) { this.tabActivo = tab; }

  async submitTriaje() {
    this.loading = true;
    try {
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
    if (!this.consulta.diagnostico) { this.showToast('El diagnóstico es obligatorio', 'error'); return; }
    this.loading = true;
    try {
      const cr: any = await lastValueFrom(this.api.crearAtencionConsulta({
        idAtencion: this.state.idAtencion,
        motivoConsulta: 'Consulta médica',
        evaluacionClinica: this.consulta.diagnostico,
        tratamiento: this.consulta.tratamiento || '--',
        indicaciones: this.consulta.observaciones || '--',
        observaciones: this.consulta.observaciones || '--',
        requiereControl: this.consulta.requiereControl,
        fechaProximoControl: this.consulta.fechaControl || null
      }));
      this.state.idConsulta = cr.data.idConsulta;

      if (this.anamnesisGuardada) {
        await lastValueFrom(this.api.crearAnamnesis({ ...this.anamnesisGuardada, idConsulta: this.state.idConsulta }));
      }

      this.showToast('Consulta guardada');
      this.showTab('receta');
    } catch(e) { this.showToast('Error al guardar consulta', 'error'); console.error(e); }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }

  agregarMedicamento() {
    if (!this.recetaForm.idMedicamento) { this.showToast('Selecciona un medicamento', 'error'); return; }
    const med = this.medicamentos.find(m => m.idMedicamento === +this.recetaForm.idMedicamento);
    this.medicamentosReceta.push({
      idMedicamento: +this.recetaForm.idMedicamento,
      nombre: med?.nombreMedicamento || '',
      dosis: this.recetaForm.dosis,
      frecuencia: this.recetaForm.frecuencia,
      duracion: this.recetaForm.duracion,
      indicacionesEspecificas: this.recetaForm.instrucciones,
      viaAdministracion: 1
    });
    this.recetaForm = { idMedicamento: '', dosis: '', frecuencia: '', duracion: '', instrucciones: '' };
    this.showToast('Medicamento agregado');
    this.cdr.detectChanges();
  }

  quitarMedicamento(i: number) { this.medicamentosReceta.splice(i, 1); this.cdr.detectChanges(); }

  async guardarReceta() {
    if (!this.medicamentosReceta.length) { this.showToast('Agrega al menos un medicamento', 'error'); return; }
    if (!this.state.idConsulta) { this.showToast('Primero completa la Consulta', 'error'); return; }
    this.loading = true;
    try {
      const rr: any = await lastValueFrom(this.api.crearReceta({
        idConsulta: this.state.idConsulta,
        fechaReceta: new Date().toISOString(),
        idEmpleadoAsociado: 1, idAsociado: 1
      }));
      const idReceta = rr.data.idReceta;

      for (const med of this.medicamentosReceta) {
        await lastValueFrom(this.api.crearRecetaDetalle({ ...med, idReceta }));
      }

      const citaRaw: any = await lastValueFrom(this.api.getCita(this.idCita));
      await lastValueFrom(this.api.actualizarCita(this.idCita, { ...citaRaw.data, idEstadoCita: 2 }));

      this.showToast('¡Atención clínica completada! ✓');
      setTimeout(() => this.router.navigate(['/citas']), 2500);
    } catch(e) { this.showToast('Error al guardar receta', 'error'); console.error(e); }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }

  showToast(msg: string, type = 'success') {
    this.toast = { visible: true, msg, type };
    this.cdr.detectChanges();
    setTimeout(() => { this.toast.visible = false; this.cdr.detectChanges(); }, 3000);
  }

  getCodigo() { return `ATC-${String(this.idCita).padStart(4,'0')}`; }
}
