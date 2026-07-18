import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { ConfiguracionService } from '../../../services/configuracion/configuracion.service';
import { RolClinica } from '../../../services/configuracion/configuracion.model';

// Barra superior reutilizable: muestra al usuario logueado (tomado del localStorage)
// y su rol real, consultado contra el catálogo de roles (RolesClinica) en vez de asumirlo.
@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styles: [':host { display: contents; }']
})
export class Topbar implements OnInit {
  private usuario: any;
  private roles: RolClinica[] = [];

  constructor(auth: AuthService, private configService: ConfiguracionService, private cdr: ChangeDetectorRef) {
    this.usuario = auth.getSesion();
  }

  ngOnInit() {
    this.configService.getRolesCatalogo().subscribe({ next: (r) => {
      this.roles = r.data || [];
      this.cdr.detectChanges();
    }});
  }

  get nombre(): string {
    if (!this.usuario) return 'Invitado';
    return `${this.usuario.nombreEmpleado ?? ''} ${this.usuario.apellidoPaterno ?? ''}`.trim() || 'Usuario';
  }

  get rol(): string {
    return this.roles.find(r => r.idRoles === this.usuario?.idRolesClinica)?.nombreRol || '—';
  }

  get iniciales(): string {
    const n = (this.usuario?.nombreEmpleado ?? '').charAt(0);
    const a = (this.usuario?.apellidoPaterno ?? '').charAt(0);
    return (n + a).toUpperCase() || '?';
  }
}
