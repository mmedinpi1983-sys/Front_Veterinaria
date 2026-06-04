import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Citas } from './pages/citas/citas';
import { Pacientes } from './pages/pacientes/pacientes';
import { Atencion } from './pages/atencion/atencion';
import { HistoriaClinica } from './pages/historia-clinica/historia-clinica';

// Definición de rutas de la aplicación VetClinic
// La ruta raíz redirige al login; rutas no encontradas también redirigen al login
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },       // Ruta raíz → login
  { path: 'login', component: Login },                         // Página de inicio de sesión
  { path: 'citas', component: Citas },                         // Gestión de citas programadas
  { path: 'pacientes', component: Pacientes },                 // Gestión de pacientes (mascotas + dueños)
  { path: 'historia-clinica/:idMascota', component: HistoriaClinica }, // Expediente clínico del paciente
  { path: 'atencion/:idCita', component: Atencion },           // Flujo de atención clínica (triaje → receta)
  { path: '**', redirectTo: 'login' }                          // Ruta no encontrada → login
];
