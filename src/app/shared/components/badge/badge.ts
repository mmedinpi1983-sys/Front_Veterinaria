import { Component, Input } from '@angular/core';

// Etiqueta de estado reutilizable. Asigna el color según el estado.
@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styles: [':host { display: contents; }']
})
export class Badge {
  @Input() estado = '';

  get clase(): string {
    const map: Record<string, string> = {
      'Pendiente': 'badge-warning',
      'Completado': 'badge-success',
      'Cancelado': 'badge-danger'
    };
    return 'badge ' + (map[this.estado] || 'badge-gray');
  }
}
