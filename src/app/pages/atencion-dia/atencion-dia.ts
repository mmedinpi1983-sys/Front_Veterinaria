import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Badge } from '../../shared/components/badge/badge';
import { CitaService } from '../../services/citas/cita.service';
import { CitaEnriquecida, VeterinarioDisponible } from '../../services/citas/citas.model';

interface GrupoVeterinario {
  nombreVeterinario: string;
  citas: CitaEnriquecida[];
}

// Vista intermedia de Atención Clínica: citas programadas de un rango de fechas
// (por defecto hoy), agrupadas por veterinario. Desde aquí se entra a la pantalla
// de Atención Clínica (Triaje→Anamnesis→Consulta→Receta) en modo iniciar/ver/editar.
@Component({
  selector: 'app-atencion-dia',
  imports: [CommonModule, FormsModule, Badge],
  templateUrl: './atencion-dia.html',
  styleUrl: './atencion-dia.css'
})
export class AtencionDia implements OnInit {
  fechaInicio = '';
  fechaFin = '';
  citas: CitaEnriquecida[] = [];
  grupos: GrupoVeterinario[] = [];
  veterinarios: VeterinarioDisponible[] = [];
  filtroVeterinario = '';
  cargando = false;

  constructor(
    private readonly citaService: CitaService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.irAHoy();
    // Lista de veterinarios independiente de la fecha/citas cargadas (mismo catálogo que usa "Nueva Cita" en Citas)
    this.citaService.getVeterinarios().subscribe({ next: (r: any) => {
      this.veterinarios = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  get veterinariosDisponibles(): string[] {
    const nombres = this.veterinarios.map(v => v.nombreVeterinario.trim());
    return Array.from(new Set(nombres)).sort((a, b) => a.localeCompare(b));
  }

  private fechaLocalHoy(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  }

  irAHoy() {
    const hoy = this.fechaLocalHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.citaService.getCitasEnriquecidas({ fechaInicio: this.fechaInicio, fechaFin: this.fechaFin }).subscribe({
      next: (r: any) => {
        this.citas = r.data || [];
        this.agrupar();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  private agrupar() {
    const mapa = new Map<string, CitaEnriquecida[]>();
    for (const c of this.citas) {
      const nombre = (c.nombreVeterinario || '').trim() || 'Sin veterinario asignado';
      if (!mapa.has(nombre)) mapa.set(nombre, []);
      mapa.get(nombre)!.push(c);
    }
    this.grupos = Array.from(mapa.entries())
      .map(([nombreVeterinario, citas]) => ({
        nombreVeterinario,
        citas: citas.slice().sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      }))
      .sort((a, b) => a.nombreVeterinario.localeCompare(b.nombreVeterinario));
  }

  get gruposMostrados(): GrupoVeterinario[] {
    return this.filtroVeterinario
      ? this.grupos.filter(g => g.nombreVeterinario === this.filtroVeterinario)
      : this.grupos;
  }

  getBadgeClass(estado: string): string {
    const map: any = { 'Pendiente': 'badge-warning', 'Completado': 'badge-success', 'Cancelado': 'badge-danger' };
    return 'badge ' + (map[estado] || 'badge-gray');
  }

  iniciar(c: CitaEnriquecida) {
    this.router.navigate(['/atencion', c.idCitaProgramada]);
  }

  ver(c: CitaEnriquecida) {
    if (!c.idAtencion) return;
    this.router.navigate(['/atencion', c.idCitaProgramada], { queryParams: { modo: 'ver' } });
  }

  editar(c: CitaEnriquecida) {
    if (!c.idAtencion) return;
    this.router.navigate(['/atencion', c.idCitaProgramada], { queryParams: { modo: 'editar' } });
  }

  get totalCitas(): number {
    return this.citas.length;
  }
}
