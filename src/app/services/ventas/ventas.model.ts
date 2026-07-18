// Modelos del módulo de Ventas (ver VentaDTO en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

export interface ProductoCatalogoVenta {
  idProducto: number;
  nombre: string;
  precioVenta: number;
  stock: number;
  categoria: string;
}

export interface MetodoPago {
  idMetodoPago: number;
  nombre: string;
}

export interface VentaListItem {
  idVenta: number;
  codigoVenta: string;
  fechaVenta: string;
  cliente: string;
  tipoComprobante: string;
  metodoPago: string;
  total: number;
  estadoVenta: number;
}

export interface VentaLinea {
  idVentaDetalle: number;
  nombreItem: string;
  tipo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaDetalle {
  idVenta: number;
  codigoVenta: string;
  idDueno: number | null;
  nombreComprador: string | null;
  dniComprador: string | null;
  tipoComprobante: string;
  fechaVenta: string;
  subTotal: number;
  descuento: number;
  igv: number;
  total: number;
  montoPagado: number;
  estadoVenta: number;
  idMetodoPago: number;
  metodoPago: string;
  items: VentaLinea[];
}

export interface VentaItemRequest {
  idProducto: number | null;
  idServicio: number | null;
  cantidad: number;
  precioUnitario: number;
}

export interface VentaCreateRequest {
  idDueno?: number | null;
  idCita?: number | null;
  idAtencion?: number | null;
  tipoComprobante: string;
  dniComprador: string | null;
  nombreComprador: string | null;
  idMetodoPago: number;
  descuento: number;
  montoPagado: number;
  items: VentaItemRequest[];
}

export interface VentaFiltros {
  q?: string;
  tipoComprobante?: string;
}
