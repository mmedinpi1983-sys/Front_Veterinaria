import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${API}/api/auth/login`, { correo, contrasena });
  }

  guardarSesion(data: any): void {
    localStorage.setItem('usuario', JSON.stringify(data));
  }

  getSesion(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('usuario');
  }
}
