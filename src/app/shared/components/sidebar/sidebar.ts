import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PermisosService, AccesoRol } from '../../../services/permisos.service';

// Barra lateral de navegación reutilizable (resalta la opción activa según la ruta,
// y solo muestra los módulos que el rol del usuario logueado tiene permitidos)
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styles: [':host { display: contents; }']
})
export class Sidebar implements OnInit {
  acceso: AccesoRol | null = null;

  constructor(private auth: AuthService, private router: Router, private permisos: PermisosService) {}

  ngOnInit() {
    this.permisos.cargar().subscribe({ next: (a) => this.acceso = a });
  }

  // Cierra la sesión de verdad: borra el usuario del localStorage y vuelve al login.
  // Así el guard de rutas vuelve a bloquear el acceso a las páginas internas.
  cerrarSesion() {
    this.auth.cerrarSesion();
    this.permisos.limpiar();
    this.router.navigate(['/login']);

 }
}