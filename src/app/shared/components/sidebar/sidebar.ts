import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Barra lateral de navegación reutilizable (resalta la opción activa según la ruta)
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styles: [':host { display: contents; }']
})
export class Sidebar {
  constructor(private auth: AuthService, private router: Router) {}

  // Cierra la sesión de verdad: borra el usuario del localStorage y vuelve al login.
  // Así el guard de rutas vuelve a bloquear el acceso a las páginas internas.
  cerrarSesion() {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
