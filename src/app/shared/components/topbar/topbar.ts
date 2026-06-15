import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

// Barra superior reutilizable: muestra al usuario logueado (tomado del localStorage)
@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styles: [':host { display: contents; }']
})
export class Topbar {
  private usuario: any;

  constructor(auth: AuthService) {
    this.usuario = auth.getSesion();
  }

  get nombre(): string {
    if (!this.usuario) return 'Invitado';
    return `${this.usuario.nombreEmpleado ?? ''} ${this.usuario.apellidoPaterno ?? ''}`.trim() || 'Usuario';
  }

  get rol(): string {
    return this.usuario?.idRolesClinica === 1 ? 'Administrador' : 'Usuario';
  }

  get iniciales(): string {
    const n = (this.usuario?.nombreEmpleado ?? '').charAt(0);
    const a = (this.usuario?.apellidoPaterno ?? '').charAt(0);
    return (n + a).toUpperCase() || '?';
  }
}
