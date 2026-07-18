// Modelos de Reportes (ver ReporteDTO en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

export interface ResumenReporte {
  ingresosMes: number;
  ingresosMesAnterior: number;
  citasAtendidas: number;
  citasAtendidasAnterior: number;
  productosVendidos: number;
  productosVendidosAnterior: number;
  pacientesNuevos: number;
  pacientesNuevosAnterior: number;
}

export interface CitaSemanaReporte {
  dia: string;
  atendidas: number;
  canceladas: number;
}

export interface IngresoCategoria {
  categoria: string;
  total: number;
}

export interface ProductoTop {
  nombre: string;
  cantidad: number;
}

export interface PacienteMes {
  mes: string;
  cantidad: number;
}

export interface ReporteData {
  resumen: ResumenReporte;
  citasSemana: CitaSemanaReporte[];
  ingresosCategoria: IngresoCategoria[];
  productosTop: ProductoTop[];
  pacientesMes: PacienteMes[];
}

export interface DetalleReporteItem {
  fecha: string;
  cliente: string;
  item: string;
  vendedor: string;
  total: number;
}
