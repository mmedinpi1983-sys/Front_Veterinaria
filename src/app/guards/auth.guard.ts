import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Guard de autenticación: protege las rutas internas del sistema.
// Si hay una sesión activa (usuario en localStorage) deja pasar; si no,
// redirige al login. Así nadie puede entrar a /citas, /pacientes, etc.
// escribiendo la URL directamente sin haber iniciado sesión.

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
