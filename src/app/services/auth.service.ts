import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

// Servicio de autenticación - maneja login y sesión del usuario en localStorage
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  // Envía credenciales al backend y retorna los datos del empleado si son correctas
  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${API}/api/auth/login`, { correo, contrasena });
  }

  // Guarda los datos del usuario logueado en localStorage para mantener la sesión
  guardarSesion(data: any): void {
    localStorage.setItem('usuario', JSON.stringify(data));
  }

  // Retorna los datos del usuario de la sesión activa
  getSesion(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  // Elimina la sesión del localStorage (logout)
  cerrarSesion(): void {
    localStorage.removeItem('usuario');
  }

  // Verifica si hay una sesión activa
  estaLogueado(): boolean {
    return !!localStorage.getItem('usuario');
  }
}
