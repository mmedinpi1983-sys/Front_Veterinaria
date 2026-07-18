import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/components/modal/modal';
import { Badge } from '../../shared/components/badge/badge';
import { Pagination } from '../../shared/components/pagination/pagination';
import { InventarioService } from '../../services/inventario/inventario.service';
import Swal from 'sweetalert2';

// Inventario: manejo de productos y los movimientos de stock (entradas, salidas, ajustes).
@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule, Modal, Badge, Pagination],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {
  tab: 'productos' | 'movimientos' = 'productos';

  productos: any[] = [];
  productosPag: any[] = [];
  itemsPorPag = 10;
  pagProd = 1;
  totalPagProd = 1;
  stats: any = { items: 0, categorias: 0, bajoStock: 0, valorTotal: 0 };
  categorias: any[] = [];
  filtroProd = { q: '', idCategoria: '' };
  filtroTimeout: any;
  modalProdVisible = false;
  editandoProd = false;
  formProd: any = this.prodVacio();

  movimientos: any[] = [];
  movimientosPag: any[] = [];
  pagMov = 1;
  totalPagMov = 1;
  movStats: any = { entradas: 0, salidas: 0, ajustes: 0 };
  clases: any[] = [];
  motivos: any[] = [];
  catalogoProd: any[] = [];
  filtroMov = { q: '', idClaseMovimiento: '' };
  modalMovVisible = false;
  formMov: any = { idProducto: '', idClaseMovimiento: '', cantidad: null, idMotivoMovimiento: '', observaciones: '' };

  constructor(private inv: InventarioService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarStatsProd();
    this.inv.getCategorias().subscribe({ next: (r: any) => { this.categorias = r.data || []; this.cdr.detectChanges(); } });
  }

  cambiarTab(t: 'productos' | 'movimientos') {
    this.tab = t;
    if (t === 'movimientos' && !this.movimientos.length) {
      this.cargarMovimientos(); this.cargarStatsMov();
      this.inv.getClases().subscribe({ next: (r: any) => { this.clases = r.data || []; this.cdr.detectChanges(); } });
      this.inv.getMotivos().subscribe({ next: (r: any) => { this.motivos = r.data || []; this.cdr.detectChanges(); } });
      this.inv.getCatalogoProductos().subscribe({ next: (r: any) => { this.catalogoProd = r.data || []; this.cdr.detectChanges(); } });
    }
  }

  cargarProductos() {
    const p: any = {};
    if (this.filtroProd.q) p['q'] = this.filtroProd.q;
    if (this.filtroProd.idCategoria) p['idCategoria'] = this.filtroProd.idCategoria;
    this.inv.getProductos(p).subscribe({ next: (r: any) => { this.productos = r.data || []; this.pagProd = 1; this.paginarProd(); this.cdr.detectChanges(); } });
  }
  cargarStatsProd() {
    this.inv.getProductoStats().subscribe({ next: (r: any) => { if (r.data) this.stats = r.data; this.cdr.detectChanges(); } });
  }
  onFiltroProd() { clearTimeout(this.filtroTimeout); this.filtroTimeout = setTimeout(() => this.cargarProductos(), 350); }

  estadoStock(p: any): string {
    if (p.stock <= p.cantidadMinima * 0.5) return 'Bajo Stock';
    if (p.stock <= p.cantidadMinima) return 'Bajo Stock';
    return 'Disponible';
  }
  claseStock(p: any): string { return p.stock <= p.cantidadMinima * 0.5 ? 'danger' : (p.stock <= p.cantidadMinima ? 'warning' : 'success'); }
  porcentajeStock(p: any): number {
    const base = Math.max(p.cantidadMinima * 2, 1);
    return Math.min(100, Math.round((p.stock / base) * 100));
  }
  badgeStock(p: any): string { return p.stock <= p.cantidadMinima ? 'Bajo Stock' : 'Disponible'; }

  prodVacio() {
    return { idProducto: null, nombre: '', idCategoria: '', cantidadIngreso: null, cantidadMinima: null,
      precioVenta: null, precioCompra: null, proveedor: '', fechaVencimiento: '', concentracion: '', notas: '', estado: true };
  }
  abrirNuevoProd() { this.editandoProd = false; this.formProd = this.prodVacio(); this.modalProdVisible = true; }
  abrirEditarProd(p: any) {
    this.inv.getProducto(p.idProducto).subscribe({ next: (r: any) => {
      const d = r.data || {};
      this.formProd = {
        idProducto: d.idProducto, nombre: d.nombre, idCategoria: d.idCategoria,
        cantidadIngreso: d.stock, cantidadMinima: d.cantidadMinima, precioVenta: d.precioVenta,
        precioCompra: d.precioCompra, proveedor: d.proveedor, fechaVencimiento: (d.fechaVencimiento || '').substring(0, 10),
        concentracion: d.concentracion, notas: d.notas, estado: d.estado
      };
      this.editandoProd = true; this.modalProdVisible = true; this.cdr.detectChanges();
    }});
  }
  guardarProd() {
    const f = this.formProd;
    if (!f.nombre || !f.idCategoria) { Swal.fire({ icon: 'warning', title: 'Nombre y categoría son obligatorios', timer: 1800, showConfirmButton: false }); return; }
    const body: any = {
      nombre: f.nombre, idCategoria: +f.idCategoria,
      cantidadIngreso: Number(f.cantidadIngreso) || 0, cantidadMinima: Number(f.cantidadMinima) || 0,
      precioVenta: Number(f.precioVenta) || 0, precioCompra: Number(f.precioCompra) || 0,
      proveedor: f.proveedor || null, fechaVencimiento: f.fechaVencimiento || null,
      concentracion: f.concentracion || null, notas: f.notas || null
    };
    const obs = this.editandoProd
      ? this.inv.actualizarProducto(f.idProducto, { ...body, estado: f.estado })
      : this.inv.crearProducto(body);
    obs.subscribe({
      next: () => { this.modalProdVisible = false; Swal.fire({ icon: 'success', title: 'Guardado', timer: 1300, showConfirmButton: false }); this.cargarProductos(); this.cargarStatsProd(); },
      error: (e: any) => Swal.fire({ icon: 'error', title: 'Error', text: e?.error?.message || e?.error?.error || '' })
    });
  }
  eliminarProd(p: any) {
    Swal.fire({ title: '¿Eliminar Producto?', text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#DC2626', cancelButtonColor: '#64748B', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' })
      .then(res => { if (!res.isConfirmed) return;
        this.inv.eliminarProducto(p.idProducto).subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false }); this.cargarProductos(); this.cargarStatsProd(); },
          error: () => Swal.fire({ icon: 'error', title: 'Error al eliminar' }) });
      });
  }

  cargarMovimientos() {
    const p: any = {};
    if (this.filtroMov.q) p['q'] = this.filtroMov.q;
    if (this.filtroMov.idClaseMovimiento) p['idClaseMovimiento'] = this.filtroMov.idClaseMovimiento;
    this.inv.getMovimientos(p).subscribe({ next: (r: any) => { this.movimientos = r.data || []; this.pagMov = 1; this.paginarMov(); this.cdr.detectChanges(); } });
  }
  cargarStatsMov() { this.inv.getMovimientoStats().subscribe({ next: (r: any) => { if (r.data) this.movStats = r.data; this.cdr.detectChanges(); } }); }
  onFiltroMov() { clearTimeout(this.filtroTimeout); this.filtroTimeout = setTimeout(() => this.cargarMovimientos(), 350); }

  badgeTipo(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('entrada')) return 'Entrada';
    if (t.includes('salida')) return 'Salida';
    return 'Ajuste';
  }
  signo(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    return t.includes('salida') ? '-' : '+';
  }

  abrirNuevoMov() { this.formMov = { idProducto: '', idClaseMovimiento: '', cantidad: null, idMotivoMovimiento: '', observaciones: '' }; this.modalMovVisible = true; }
  guardarMov() {
    const f = this.formMov;
    if (!f.idProducto || !f.idClaseMovimiento || !f.cantidad || !f.idMotivoMovimiento) {
      Swal.fire({ icon: 'warning', title: 'Completa producto, tipo, cantidad y motivo', timer: 1800, showConfirmButton: false }); return;
    }
    this.inv.crearMovimiento({
      idProducto: +f.idProducto, idClaseMovimiento: +f.idClaseMovimiento,
      cantidad: Number(f.cantidad), idMotivoMovimiento: +f.idMotivoMovimiento, observaciones: f.observaciones || null
    }).subscribe({
      next: () => { this.modalMovVisible = false; Swal.fire({ icon: 'success', title: 'Movimiento registrado', timer: 1400, showConfirmButton: false }); this.cargarMovimientos(); this.cargarStatsMov(); },
      error: (e: any) => Swal.fire({ icon: 'error', title: 'Error', text: e?.error?.error || e?.error?.message || 'Intenta nuevamente.' })
    });
  }
  // Paginacion de las tablas (10 por pagina)
  paginarProd() {
    this.totalPagProd = Math.max(1, Math.ceil(this.productos.length / this.itemsPorPag));
    const ini = (this.pagProd - 1) * this.itemsPorPag;
    this.productosPag = this.productos.slice(ini, ini + this.itemsPorPag);
  }
  cambiarPagProd(p: number) { if (p < 1 || p > this.totalPagProd) return; this.pagProd = p; this.paginarProd(); }

  paginarMov() {
    this.totalPagMov = Math.max(1, Math.ceil(this.movimientos.length / this.itemsPorPag));
    const ini = (this.pagMov - 1) * this.itemsPorPag;
    this.movimientosPag = this.movimientos.slice(ini, ini + this.itemsPorPag);
  }
  cambiarPagMov(p: number) { if (p < 1 || p > this.totalPagMov) return; this.pagMov = p; this.paginarMov(); }
}

