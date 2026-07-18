import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Página de inicio de sesión - valida credenciales y redirige al módulo de Citas
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo = '';
  contrasena = '';
  cargando = false; // Controla el estado del botón durante la petición
  mostrarClave = false; // Toggle del ojito para ver/ocultar la contraseña

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  // Valida campos, llama al backend y guarda la sesión en localStorage si es exitoso
  ingresar() {
    if (!this.correo || !this.contrasena) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos', timer: 1500, showConfirmButton: false });
      return;
    }
    this.cargando = true;
    this.authService.login(this.correo, this.contrasena)
      .pipe(finalize(() => { this.cargando = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (r: any) => {
          this.authService.guardarSesion(r.data);
          this.router.navigate(['/citas']); // Redirige al módulo principal tras login exitoso
        },
        error: (err: any) => {
          const mensaje = err?.error?.message || 'Credenciales incorrectas';
          if (mensaje === 'Cuenta inactiva') {
            this.correo = '';
            this.contrasena = '';
          } else {
            this.contrasena = '';
          }
          Swal.fire({ icon: 'error', title: mensaje, text: mensaje === 'Cuenta inactiva' ? 'Contacta al administrador para reactivar tu cuenta.' : 'Verifica tu correo y contraseña.' });
        }
      });
  }
}
