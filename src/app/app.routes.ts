import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './shared/components/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Citas } from './pages/citas/citas';
import { Pacientes } from './pages/pacientes/pacientes';
import { Atencion } from './pages/atencion/atencion';
import { HistoriaClinica } from './pages/historia-clinica/historia-clinica';
import { Ventas } from './pages/ventas/ventas';
import { Configuracion } from './pages/configuracion/configuracion';
import { authGuard } from './guards/auth.guard';
import { moduloGuard } from './guards/modulo.guard';

// Rutas de la aplicación VetClinic.
// El login va fuera del layout; las demás páginas se muestran DENTRO del Layout
// (que aporta la barra lateral y la barra superior una sola vez).
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },       // Ruta raíz → login
  { path: 'login', component: Login },                         // Inicio de sesión (sin layout)
  {
    path: '',
    component: Layout,                                          // Layout con sidebar + topbar
    canActivate: [authGuard],                                  //  protege todo lo de adentro: exige sesión
    children: [
      { path: 'dashboard', component: Dashboard, canActivate: [moduloGuard('dashboard')] },            // Panel de indicadores
      { path: 'pacientes', component: Pacientes, canActivate: [moduloGuard('pacientes')] },             // Gestión de pacientes
      { path: 'citas', component: Citas, canActivate: [moduloGuard('citas')] },                     // Gestión de citas
      { path: 'historia-clinica/:idMascota', component: HistoriaClinica, canActivate: [moduloGuard('pacientes')] }, // Expediente clínico
      { path: 'atencion/:idCita', component: Atencion, canActivate: [moduloGuard('atencion clinica')] },       // Atención clínica
      { path: 'ventas', component: Ventas, canActivate: [moduloGuard('ventas')] },                   // Ventas (POS + historial)
      { path: 'configuracion', component: Configuracion, canActivate: [moduloGuard('configuracion')] },     // Configuración del sistema
    ]
  },
  { path: '**', redirectTo: 'login' }                          // Ruta no encontrada → login
];
