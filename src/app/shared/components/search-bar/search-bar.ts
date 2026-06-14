import { Component, Input, Output, EventEmitter } from '@angular/core';

// Caja de búsqueda reutilizable. Enlace bidireccional con [(texto)] y emite (buscar) en cada cambio.
@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styles: [':host { display: contents; }']
})
export class SearchBar {
  @Input() placeholder = 'Buscar...';
  @Input() texto = '';
  @Output() textoChange = new EventEmitter<string>();
  @Output() buscar = new EventEmitter<void>();

  onInput(v: string) {
    this.texto = v;
    this.textoChange.emit(v);
    this.buscar.emit();
  }
}
