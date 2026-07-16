import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Badge } from '../../shared/components/badge/badge';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

// Pantalla de inicio con los numeros del dia: citas, pacientes, ingresos y stock.
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Badge],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  nombreUsuario = 'Usuario';
  hoyTexto = '';

  resumen: any = {
    citasHoyTotal: 0, citasHoyCompletadas: 0, citasHoyPendientes: 0,
    pacientesActivos: 0, pacientesNuevosMes: 0,
    ingresosHoy: 0, ingresosAyer: 0, alertasStock: 0
  };
  citasHoy: any[] = [];
  alertasStock: any[] = [];
  citasSemana: { etiqueta: string; cantidad: number }[] = [];

  private readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(
    private dash: DashboardService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const sesion = this.auth.getSesion();
    this.nombreUsuario = sesion?.nombreEmpleado || 'Usuario';

    const hoy = new Date();
    this.hoyTexto = hoy.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    this.cargarDashboard();
    this.cargarCitasHoy(fechaLocal);
  }

  cargarDashboard() {
    this.dash.getDashboard().subscribe({
      next: (r: any) => {
        const d = r.data || {};
        if (d.resumen) this.resumen = d.resumen;
        this.alertasStock = d.alertasStock || [];
        this.construirSemana(d.citasSemana || []);
        this.cdr.detectChanges();
      }
    });
  }

  cargarCitasHoy(fecha: string) {
    this.dash.getCitasDia(fecha).subscribe({
      next: (r: any) => { this.citasHoy = r.data || []; this.cdr.detectChanges(); }
    });
  }

  // Convierte las fechas devueltas por el backend en barras Lun..Dom de la semana actual
  construirSemana(datos: any[]) {
    const conteo: Record<string, number> = {};
    for (const it of datos) {
      const dia = new Date(it.dia + 'T00:00:00');
      const idx = (dia.getDay() + 6) % 7; // 0 = Lunes
      conteo[this.diasSemana[idx]] = (conteo[this.diasSemana[idx]] || 0) + (it.cantidad || 0);
    }
    this.citasSemana = this.diasSemana.slice(0, 6).map(e => ({ etiqueta: e, cantidad: conteo[e] || 0 }));
  }

  get maxSemana(): number {
    return Math.max(1, ...this.citasSemana.map(d => d.cantidad));
  }

  alturaBarra(cantidad: number): number {
    return Math.round((cantidad / this.maxSemana) * 100);
  }

  get variacionIngresos(): number | null {
    const ayer = Number(this.resumen.ingresosAyer) || 0;
    const hoy = Number(this.resumen.ingresosHoy) || 0;
    if (ayer === 0) return null;
    return Math.round(((hoy - ayer) / ayer) * 100);
  }

  porcentajeStock(a: any): number {
    if (!a.minimo) return 100;
    return Math.min(100, Math.round((a.stock / a.minimo) * 100));
  }

  claseStock(a: any): string {
    return a.stock <= a.minimo * 0.5 ? 'danger' : 'warning';
  }

  hora(c: any): string {
    return (c.horaInicio || '').toString().substring(0, 5);
  }

  irCitas() { this.router.navigate(['/citas']); }
  irPacientes() { this.router.navigate(['/pacientes']); }
}
