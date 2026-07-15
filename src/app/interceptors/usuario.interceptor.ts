import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Interceptor de auditoría/autenticación: agrega el header "X-Usuario-Id" con el id del
// empleado logueado y el header "Authorization" con el token JWT (tomados del localStorage
// vía AuthService) a TODAS las peticiones HTTP. El backend exige el JWT para cualquier
// endpoint que no sea /api/auth/**, y usa X-Usuario-Id para registrar quién crea/modifica/elimina.

export const usuarioInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(AuthService).getSesion();
  const id = sesion?.idEmpleadoAsociado;
  const token = sesion?.token;
  const headers: Record<string, string> = {};
  if (id != null) headers['X-Usuario-Id'] = String(id);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (Object.keys(headers).length) {
    req = req.clone({ setHeaders: headers });
  }
  return next(req);
};
