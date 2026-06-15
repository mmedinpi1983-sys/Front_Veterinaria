import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PacienteService } from '../../services/paciente.service';

const API = 'http://localhost:8080';

// Página de Historia Clínica
// Muestra el expediente completo de una mascota: información del paciente, propietario,
// historial de atenciones clínicas y citas programadas organizados en tabs
@Component({
  selector: 'app-historia-clinica',
  imports: [CommonModule, RouterLink],
  templateUrl: './historia-clinica.html',
  styleUrl: './historia-clinica.css'
})
export class HistoriaClinica implements OnInit {
  idMascota = 0;
  mascota: any = null;
  dueno: any = null;
  historial: any[] = [];
  citas: any[] = [];
  tabActivo = 'historial';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private pacienteService: PacienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.idMascota = +this.route.snapshot.paramMap.get('idMascota')!;
    this.cargarDatos();
  }

  cargarDatos() {
    this.http.get<any>(`${API}/api/mascota/buscar`).subscribe({ next: (r: any) => {
      const m = (r.data || []).find((x: any) => x.idMascota === this.idMascota);
      if (m) {
        this.mascota = m;
        if (m.idDueno) {
          this.pacienteService.getDueno(m.idDueno).subscribe({ next: (d: any) => {
            this.dueno = d.data;
            this.cdr.detectChanges();
          }});
        }
      }
      this.cdr.detectChanges();
    }});

    this.http.get<any>(`${API}/api/atencion/historial/${this.idMascota}`).subscribe({
      next: (r: any) => { this.historial = r.data || []; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.http.get<any>(`${API}/api/citaprogramada/por-mascota/${this.idMascota}`).subscribe({
      next: (r: any) => { this.citas = r.data || []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  getBadgeCita(estado: string): string {
    const map: any = { 'Pendiente': 'badge-warning', 'Completado': 'badge-success', 'Cancelado': 'badge-danger' };
    return 'badge ' + (map[estado] || 'badge-gray');
  }
}
