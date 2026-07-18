import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/components/modal/modal';
import { Pagination } from '../../shared/components/pagination/pagination';
import { Badge } from '../../shared/components/badge/badge';
import { VentaService } from '../../services/ventas/venta.service';
import Swal from 'sweetalert2';

// El modulo de ventas: el POS para cobrar y el historial de lo vendido.
@Component({
  selector: 'app-ventas',
  imports: [CommonModule, FormsModule, Modal, Pagination, Badge],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {
  // Vista activa: 'pos' (registro) o 'historial'
  vista: 'pos' | 'historial' = 'pos';

  productos: any[] = [];
  categorias: string[] = [];
  filtroCategoria = '';
  busquedaProducto = '';
  carrito: any[] = [];
  metodosPago: any[] = [];
  idMetodoPago: number | '' = '';
  tipoComprobante = 'Boleta';
  descuento = 0;
  montoRecibido: number | null = null;
  cliente: { nombre: string; dni: string } = { nombre: '', dni: '' };
  nuevoCliente = { nombre: '', dni: '', telefono: '' };
  modalClienteVisible = false;

  ventas: any[] = [];
  ventasPaginadas: any[] = [];
  filtro = { q: '', tipoComprobante: '' };
  filtroTimeout: any;
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;
  modalDetalleVisible = false;
  ventaDetalle: any = null;

  constructor(private ventaService: VentaService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarMetodos();
  }

  cargarProductos() {
    this.ventaService.getProductos().subscribe({
      next: (r: any) => {
        this.productos = r.data || [];
        this.categorias = Array.from(new Set(this.productos.map(p => p.categoria).filter(Boolean)));
        this.cdr.detectChanges();
      }
    });
  }

  cargarMetodos() {
    this.ventaService.getMetodosPago().subscribe({
      next: (r: any) => {
        this.metodosPago = r.data || [];
        if (this.metodosPago.length && this.idMetodoPago === '') this.idMetodoPago = this.metodosPago[0].idMetodoPago;
        this.cdr.detectChanges();
      }
    });
  }

  get productosFiltrados(): any[] {
    const q = this.busquedaProducto.trim().toLowerCase();
    return this.productos.filter(p =>
      (!this.filtroCategoria || p.categoria === this.filtroCategoria) &&
      (!q || (p.nombre || '').toLowerCase().includes(q)));
  }

  icono(p: any): string {
    const c = (p.categoria || '').toLowerCase();
    if (c.includes('medic')) return 'medication';
    if (c.includes('vacun')) return 'vaccines';
    if (c.includes('alim')) return 'restaurant';
    if (c.includes('acces')) return 'pets';
    return 'inventory_2';
  }

  cantidadEnCarrito(idProducto: number): number {
    const item = this.carrito.find(i => i.idProducto === idProducto);
    return item ? item.cantidad : 0;
  }

  agregar(p: any) {
    const disponible = Number(p.stock) || 0;
    const item = this.carrito.find(i => i.idProducto === p.idProducto);
    if (item) {
      if (item.cantidad >= disponible) {
        Swal.fire({ icon: 'warning', title: 'No hay más stock disponible', timer: 1400, showConfirmButton: false });
        return;
      }
      item.cantidad++;
    } else {
      if (disponible <= 0) {
        Swal.fire({ icon: 'warning', title: 'Producto sin stock', timer: 1400, showConfirmButton: false });
        return;
      }
      this.carrito.push({
        idProducto: p.idProducto,
        nombre: p.nombre,
        precioUnitario: Number(p.precioVenta) || 0,
        cantidad: 1,
        icon: this.icono(p)
      });
    }
  }

  cambiarCantidad(p: any, delta: number) {
    const item = this.carrito.find(i => i.idProducto === p.idProducto);
    if (!item) {
      if (delta > 0) this.agregar(p);
      return;
    }
    if (delta > 0 && item.cantidad >= (Number(p.stock) || 0)) {
      Swal.fire({ icon: 'warning', title: 'No hay más stock disponible', timer: 1400, showConfirmButton: false });
      return;
    }
    item.cantidad += delta;
    if (item.cantidad <= 0) this.quitar(item);
  }

  quitar(item: any) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

  get subtotalBruto(): number {
    return this.carrito.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  }
  get total(): number {
    return Math.max(0, this.subtotalBruto - (Number(this.descuento) || 0));
  }
  get base(): number {
    return this.total / 1.18;
  }
  get igv(): number {
    return this.total - this.base;
  }
  get vuelto(): number {
    const recibido = Number(this.montoRecibido) || 0;
    return recibido > this.total ? recibido - this.total : 0;
  }

  abrirModalCliente() {
    this.nuevoCliente = { nombre: '', dni: '', telefono: '' };
    this.modalClienteVisible = true;
  }

  guardarCliente() {
    if (!this.nuevoCliente.nombre.trim() || !this.nuevoCliente.dni.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre y DNI son obligatorios', timer: 1600, showConfirmButton: false });
      return;
    }
    this.cliente = { nombre: this.nuevoCliente.nombre.trim(), dni: this.nuevoCliente.dni.trim() };
    this.modalClienteVisible = false;
  }

  cancelarVenta() {
    this.carrito = [];
    this.descuento = 0;
    this.montoRecibido = null;
    this.cliente = { nombre: '', dni: '' };
  }

  confirmarVenta() {
    if (!this.carrito.length) {
      Swal.fire({ icon: 'warning', title: 'Agrega al menos un producto', timer: 1600, showConfirmButton: false });
      return;
    }
    if (this.idMetodoPago === '') {
      Swal.fire({ icon: 'warning', title: 'Selecciona un método de pago', timer: 1600, showConfirmButton: false });
      return;
    }
    const body = {
      tipoComprobante: this.tipoComprobante,
      nombreComprador: this.cliente.nombre || null,
      dniComprador: this.cliente.dni || null,
      idMetodoPago: +this.idMetodoPago,
      descuento: Number(this.descuento) || 0,
      montoPagado: Number(this.montoRecibido) || this.total,
      items: this.carrito.map(i => ({
        idProducto: i.idProducto,
        idServicio: null,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario
      }))
    };
    this.ventaService.crearVenta(body).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Venta registrada', timer: 1500, showConfirmButton: false });
        this.cancelarVenta();
        this.cargarProductos(); // refresca el stock mostrado (se descontó en el backend)
      },
      error: (err: any) => {
        const msg = err?.error?.error || err?.error?.message;
        Swal.fire({ icon: 'error', title: 'Error al registrar la venta', text: msg || 'Intenta nuevamente.' });
      }
    });
  }

  irHistorial() {
    this.vista = 'historial';
    this.cargarHistorial();
  }
  irPos() {
    this.vista = 'pos';
  }

  cargarHistorial() {
    const params: any = {};
    if (this.filtro.q) params['q'] = this.filtro.q;
    if (this.filtro.tipoComprobante) params['tipoComprobante'] = this.filtro.tipoComprobante;
    this.ventaService.getVentas(params).subscribe({
      next: (r: any) => {
        this.ventas = r.data || [];
        this.paginaActual = 1;
        this.actualizarPaginacion();
        this.cdr.detectChanges();
      }
    });
  }

  onFiltroChange() {
    clearTimeout(this.filtroTimeout);
    this.filtroTimeout = setTimeout(() => this.cargarHistorial(), 350);
  }

  actualizarPaginacion() {
    this.totalPaginas = Math.max(1, Math.ceil(this.ventas.length / this.itemsPorPagina));
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.ventasPaginadas = this.ventas.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.actualizarPaginacion();
  }

  estadoTexto(estado: number): string {
    return estado === 1 ? 'Completado' : 'Cancelado';
  }

  verDetalle(v: any) {
    this.ventaService.getVenta(v.idVenta).subscribe({
      next: (r: any) => {
        this.ventaDetalle = r.data;
        this.modalDetalleVisible = true;
        this.cdr.detectChanges();
      }
    });
  }

  anular(v: any) {
    Swal.fire({
      title: '¿Anular esta venta?',
      text: 'La venta quedará marcada como anulada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'No, volver'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.ventaService.anularVenta(v.idVenta).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Venta anulada', timer: 1400, showConfirmButton: false });
          this.cargarHistorial();
          this.cargarProductos(); // el backend restauró el stock; refresca lo que se ve en el POS
        },
        error: () => Swal.fire({ icon: 'error', title: 'Error al anular' })
      });
    });
  }

  imprimir(v: any) {
    this.ventaService.getVenta(v.idVenta).subscribe({
      next: (r: any) => {
        this.ventaDetalle = r.data;
        this.modalDetalleVisible = true;
        this.cdr.detectChanges();
        setTimeout(() => window.print(), 300);
      }
    });
  }
}
