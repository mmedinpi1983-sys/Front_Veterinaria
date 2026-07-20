import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './shared/components/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Citas } from './pages/citas/citas';
import { Programacion } from './pages/programacion/programacion';
import { Pacientes } from './pages/pacientes/pacientes';
import { Atencion } from './pages/atencion/atencion';
import { AtencionDia } from './pages/atencion-dia/atencion-dia';
import { HistoriaClinica } from './pages/historia-clinica/historia-clinica';
import { Ventas } from './pages/ventas/ventas';
import { Configuracion } from './pages/configuracion/configuracion';
import { Inventario } from './pages/inventario/inventario';
import { Reportes } from './pages/reportes/reportes';
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
      { path: 'dashboard', component: Dashboard, canActivate: [moduloGuard('dashboard')] },                           // Panel de indicadores
      { path: 'pacientes', component: Pacientes, canActivate: [moduloGuard('pacientes')] },                          // Gestión de pacientes
      { path: 'citas', component: Citas, canActivate: [moduloGuard('citas')] },                                      // Gestión de citas
      { path: 'programacion', component: Programacion, canActivate: [moduloGuard('programacion')] },                  // Programación de veterinarios (turnos)
      { path: 'historia-clinica/:idMascota', component: HistoriaClinica, canActivate: [moduloGuard('pacientes')] },  // Expediente clínico
      { path: 'atencion', component: AtencionDia, canActivate: [moduloGuard('atencion clinica')] },                  // Vista intermedia: citas del día por veterinario
      { path: 'atencion/:idCita', component: Atencion, canActivate: [moduloGuard('atencion clinica')] },             // Atención clínica
      { path: 'ventas', component: Ventas, canActivate: [moduloGuard('ventas')] },                                   // Ventas (POS + historial)
      { path: 'inventario', component: Inventario, canActivate: [moduloGuard('inventario')] },                       // Inventario (productos + movimientos)
      { path: 'reportes', component: Reportes, canActivate: [moduloGuard('reportes')] },                           // Reportes y estadísticas
      { path: 'configuracion', component: Configuracion, canActivate: [moduloGuard('configuracion')] },              // Configuración del sistema
    ]
  },
  { path: '**', redirectTo: 'login' }                          // Ruta no encontrada → login
];
