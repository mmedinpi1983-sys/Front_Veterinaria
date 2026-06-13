import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Barra lateral de navegación reutilizable (resalta la opción activa según la ruta)
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styles: [':host { display: contents; }']
})
export class Sidebar {}
