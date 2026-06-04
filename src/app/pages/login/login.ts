import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  correo = '';
  contrasena = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  ingresar() {
    if (!this.correo || !this.contrasena) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos', timer: 1500, showConfirmButton: false });
      return;
    }
    this.cargando = true;
    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (r: any) => {
        this.authService.guardarSesion(r.data);
        this.router.navigate(['/citas']);
      },
      error: () => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Credenciales incorrectas', text: 'Verifica tu correo y contraseña.' });
      }
    });
  }
}
