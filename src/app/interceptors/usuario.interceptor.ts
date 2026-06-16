import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Interceptor de auditoría: agrega el header "X-Usuario-Id" con el id del empleado
// logueado (tomado del localStorage vía AuthService) a TODAS las peticiones HTTP,
// para que el backend registre quién crea/modifica/elimina cada registro.

export const usuarioInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(AuthService).getSesion();
  const id = sesion?.idEmpleadoAsociado;
  if (id != null) {
    req = req.clone({ setHeaders: { 'X-Usuario-Id': String(id) } });
  }
  return next(req);
};
