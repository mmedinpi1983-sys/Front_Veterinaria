import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './shared/components/layout/layout';
import { Citas } from './pages/citas/citas';
import { Pacientes } from './pages/pacientes/pacientes';
import { Atencion } from './pages/atencion/atencion';
import { HistoriaClinica } from './pages/historia-clinica/historia-clinica';

// Rutas de la aplicación VetClinic.
// El login va fuera del layout; las demás páginas se muestran DENTRO del Layout
// (que aporta la barra lateral y la barra superior una sola vez).
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },       // Ruta raíz → login
  { path: 'login', component: Login },                         // Inicio de sesión (sin layout)
  {
    path: '',
    component: Layout,                                          // Layout con sidebar + topbar
    children: [
      { path: 'pacientes', component: Pacientes },             // Gestión de pacientes
      { path: 'citas', component: Citas },                     // Gestión de citas
      { path: 'historia-clinica/:idMascota', component: HistoriaClinica }, // Expediente clínico
      { path: 'atencion/:idCita', component: Atencion },       // Atención clínica
    ]
  },
  { path: '**', redirectTo: 'login' }                          // Ruta no encontrada → login
];
