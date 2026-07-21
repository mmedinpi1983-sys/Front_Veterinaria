import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/components/modal/modal';
import { Pagination } from '../../shared/components/pagination/pagination';
import { ReporteService } from '../../services/reportes/reporte.service';
import Swal from 'sweetalert2';

// Reportes de la clinica: resumen, graficos y un detalle que se filtra por fechas.
@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, Modal, Pagination],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  resumen: any = {
    ingresosMes: 0, ingresosMesAnterior: 0, citasAtendidas: 0, citasAtendidasAnterior: 0,
    productosVendidos: 0, productosVendidosAnterior: 0, pacientesNuevos: 0, pacientesNuevosAnterior: 0
  };
  citasSemana: { etiqueta: string; atendidas: number; canceladas: number }[] = [];
  ingresosCategoria: any[] = [];
  productosTop: any[] = [];
  pacientesMes: { etiqueta: string; cantidad: number }[] = [];

  // colores para el doughnut / leyenda de categorías
  colores = ['#0EA5E9', '#1E3A5F', '#16A34A', '#F59E0B', '#8B5CF6', '#64748B'];

  // generación del reporte Excel
  modalFiltrosVisible = false;
  descargando = false;
  filtro = { fechaInicio: '', fechaFin: '' };
  hojas = { resumen: true, ventas: true, citas: true, veterinarios: false };

  private readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  private readonly meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  constructor(private rep: ReporteService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.rep.getReporte().subscribe({ next: (r: any) => {
      const d = r.data || {};
      if (d.resumen) this.resumen = d.resumen;
      this.construirSemana(d.citasSemana || []);
      this.ingresosCategoria = d.ingresosCategoria || [];
      this.productosTop = d.productosTop || [];
      this.construirMeses(d.pacientesMes || []);
      this.cdr.detectChanges();
    }});
  }

  construirSemana(datos: any[]) {
    const mapa: Record<string, { a: number; c: number }> = {};
    for (const it of datos) {
      const dia = new Date(it.dia + 'T00:00:00');
      const et = this.diasSemana[(dia.getDay() + 6) % 7];
      mapa[et] = { a: (mapa[et]?.a || 0) + (it.atendidas || 0), c: (mapa[et]?.c || 0) + (it.canceladas || 0) };
    }
    this.citasSemana = this.diasSemana.slice(0, 6).map(e => ({ etiqueta: e, atendidas: mapa[e]?.a || 0, canceladas: mapa[e]?.c || 0 }));
  }
  construirMeses(datos: any[]) {
    this.pacientesMes = datos.map(it => {
      const f = new Date(it.mes + 'T00:00:00');
      return { etiqueta: this.meses[f.getMonth()], cantidad: it.cantidad || 0 };
    });
  }

  get maxSemana(): number { return Math.max(1, ...this.citasSemana.map(d => d.atendidas + d.canceladas)); }
  get maxTop(): number { return Math.max(1, ...this.productosTop.map(p => p.cantidad)); }
  get maxMes(): number { return Math.max(1, ...this.pacientesMes.map(p => p.cantidad)); }
  get totalIngresos(): number { return this.ingresosCategoria.reduce((s, c) => s + Number(c.total || 0), 0); }

  altura(v: number, max: number): number { return Math.round((v / max) * 100); }
  pct(v: number): number { const t = this.totalIngresos; return t ? Math.round((Number(v) / t) * 100) : 0; }

  // conic-gradient para el doughnut de ingresos por categoría
  get gradiente(): string {
    if (!this.totalIngresos) return '#E2E8F0';
    let acc = 0; const partes: string[] = [];
    this.ingresosCategoria.forEach((c, i) => {
      const ini = (acc / this.totalIngresos) * 360;
      acc += Number(c.total || 0);
      const fin = (acc / this.totalIngresos) * 360;
      partes.push(`${this.colores[i % this.colores.length]} ${ini}deg ${fin}deg`);
    });
    return `conic-gradient(${partes.join(', ')})`;
  }

  variacion(actual: number, anterior: number): number | null {
    const a = Number(anterior) || 0, b = Number(actual) || 0;
    if (a === 0) return null;
    return Math.round(((b - a) / a) * 100);
  }

  abrirFiltros() { this.modalFiltrosVisible = true; }

  get algunaHoja(): boolean { return Object.values(this.hojas).some(v => v); }

  generar() {
    const tipos = Object.entries(this.hojas).filter(([, v]) => v).map(([k]) => k);
    if (!tipos.length) {
      Swal.fire({ icon: 'warning', title: 'Selecciona al menos una hoja', timer: 1800, showConfirmButton: false });
      return;
    }
    this.descargando = true;
    this.rep.descargarExcel(tipos, this.filtro.fechaInicio, this.filtro.fechaFin).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.descargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.descargando = false;
        Swal.fire({ icon: 'error', title: 'No se pudo generar el reporte' });
        this.cdr.detectChanges();
      }
    });
  }

  limpiar() { this.filtro = { fechaInicio: '', fechaFin: '' }; }
}

