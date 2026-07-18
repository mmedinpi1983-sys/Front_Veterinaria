// Modelos del Dashboard (ver DashboardDTO en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
import { CitaEnriquecida } from '../citas/citas.model';
export type { ApiResponse, CitaEnriquecida };

export interface ResumenDashboard {
  citasHoyTotal: number;
  citasHoyCompletadas: number;
  citasHoyPendientes: number;
  pacientesActivos: number;
  pacientesNuevosMes: number;
  ingresosHoy: number;
  ingresosAyer: number;
  alertasStock: number;
}

export interface CitaSemana {
  dia: string;
  cantidad: number;
}

export interface AlertaStock {
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
}

export interface DashboardData {
  resumen: ResumenDashboard;
  citasSemana: CitaSemana[];
  alertasStock: AlertaStock[];
}
