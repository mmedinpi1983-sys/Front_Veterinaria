import { Component, Input, Output, EventEmitter } from '@angular/core';

// Barra de pestañas reutilizable. Recibe la lista de pestañas y cuál está activa; emite la seleccionada.
@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.html',
  styles: [':host { display: contents; }']
})
export class Tabs {
  @Input() tabs: { id: string; label: string }[] = [];
  @Input() activo = '';
  @Output() activoChange = new EventEmitter<string>();
}
