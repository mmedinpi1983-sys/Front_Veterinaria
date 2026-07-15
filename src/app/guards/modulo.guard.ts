import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PermisosService } from '../services/permisos.service';
import { map, catchError, of } from 'rxjs';

// Rutas candidatas para redirigir cuando al usuario le falta el módulo pedido,
// probadas en este orden hasta encontrar una que sí tenga permitida.
const RUTA_POR_MODULO: { modulo: string; ruta: string }[] = [
  { modulo: 'pacientes', ruta: '/pacientes' },
  { modulo: 'citas', ruta: '/citas' },
  { modulo: 'configuracion', ruta: '/configuracion' }
];

// Guard de módulo: bloquea la ruta si el rol del usuario logueado no tiene el módulo indicado
// en la matriz de "Permisos por Perfil" (Configuración > Usuarios). Si no lo tiene, redirige
// al primer módulo que sí tenga permitido, o al login si no tiene ninguno.
export function moduloGuard(modulo: string): CanActivateFn {
  return () => {
    const permisos = inject(PermisosService);
    const router = inject(Router);

    return permisos.cargar().pipe(
      map(acceso => {
        if (acceso.superAdmin || acceso.modulos.includes(modulo)) return true;
        const alternativa = RUTA_POR_MODULO.find(r => acceso.modulos.includes(r.modulo));
        router.navigate([alternativa ? alternativa.ruta : '/login']);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
}
