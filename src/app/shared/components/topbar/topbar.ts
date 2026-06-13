import { Component } from '@angular/core';

// Barra superior reutilizable (botón de ayuda + datos del usuario)
@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styles: [':host { display: contents; }']
})
export class Topbar {}
