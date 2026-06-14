import { Component, Input, Output, EventEmitter } from '@angular/core';

// Paginación reutilizable. Recibe la página actual y el total, y emite la página seleccionada.
@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html'
})
export class Pagination {
  @Input() paginaActual = 1;
  @Input() totalPaginas = 1;
  @Output() cambiar = new EventEmitter<number>();

  // Genera el arreglo de números de página [1..totalPaginas]
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }
}
