import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

const API = 'http://localhost:8080';

export interface AccesoRol {
  superAdmin: boolean;
  modulos: string[];
}

// Resuelve y cachea a qué módulos tiene acceso el rol del usuario logueado (según la matriz
// "Permisos por Perfil" de Configuración). Lo usan el sidebar (para ocultar módulos) y los
// guards de rutas (para bloquear la navegación directa por URL).
@Injectable({ providedIn: 'root' })
export class PermisosService {
  private cache$: Observable<AccesoRol> | null = null;

  constructor(private http: HttpClient) {}

  cargar(): Observable<AccesoRol> {
    if (!this.cache$) {
      this.cache$ = this.http.get(`${API}/api/rolpermiso/mismodulos`).pipe(
        map((r: any) => r.data as AccesoRol),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  // Se llama al cerrar sesión para que el próximo login (posiblemente otro usuario/rol) no reuse este caché.
  limpiar(): void {
    this.cache$ = null;
  }
}
