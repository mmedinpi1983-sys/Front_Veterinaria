// Modelos del módulo de Inventario (ver ProductoDTO y MovimientoProductoDTO en Backend_Veterinaria).
import { ApiResponse } from '../shared/api-response.model';
export type { ApiResponse };

export interface ProductoListItem {
  idProducto: number;
  nombre: string;
  categoria: string;
  idCategoria: number;
  stock: number;
  cantidadMinima: number;
  precioVenta: number;
  proveedor: string | null;
  fechaVencimiento: string | null;
  estado: boolean;
}

export interface ProductoDetalle {
  idProducto: number;
  nombre: string;
  idCategoria: number;
  categoria: string;
  stock: number;
  cantidadMinima: number;
  precioVenta: number;
  precioCompra: number;
  proveedor: string | null;
  fechaVencimiento: string | null;
  concentracion: string | null;
  notas: string | null;
  estado: boolean;
}

export interface ProductoStats {
  items: number;
  categorias: number;
  bajoStock: number;
  valorTotal: number;
}

export interface CategoriaProducto {
  idCategoria: number;
  nombreCategoria: string;
}

export interface ProductoFiltros {
  q?: string;
  idCategoria?: string | number;
}

export interface ProductoCreateRequest {
  nombre: string;
  idCategoria: number;
  cantidadIngreso: number;
  cantidadMinima: number;
  precioVenta: number;
  precioCompra: number;
  proveedor: string | null;
  fechaVencimiento: string | null;
  concentracion: string | null;
  notas: string | null;
}

export type ProductoUpdateRequest = ProductoCreateRequest & { estado?: boolean };

export interface ProductoCatalogoItem {
  idProducto: number;
  nombre: string;
  precioVenta: number;
  stock: number;
}

export interface MovimientoListItem {
  idMovimiento: number;
  fecha: string;
  producto: string;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  empleado: string;
}

export interface MovimientoStats {
  entradas: number;
  salidas: number;
  ajustes: number;
}

export interface ClaseMovimiento {
  idClaseMovimiento: number;
  descripcion: string;
}

export interface MotivoMovimiento {
  idMotivoMovimiento: number;
  descripcion: string;
}

export interface MovimientoFiltros {
  q?: string;
  idClaseMovimiento?: string | number;
}

export interface MovimientoCreateRequest {
  idProducto: number;
  idClaseMovimiento: number;
  cantidad: number;
  idMotivoMovimiento: number;
  observaciones: string | null;
}
