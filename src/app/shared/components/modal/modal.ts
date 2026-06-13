import { Component, Input, Output, EventEmitter } from '@angular/core';

// Ventana modal reutilizable. Se envuelve en un @if en la página para controlar su visibilidad.
// El cuerpo va proyectado dentro de <app-modal>...</app-modal>
// y los botones del pie en un elemento con el atributo [modal-footer].
// Si no hay pie, pasar [footer]="false".
@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html'
})
export class Modal {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() size: '' | 'lg' | 'sm' = '';
  @Input() footer = true;
  @Output() close = new EventEmitter<void>();
}
