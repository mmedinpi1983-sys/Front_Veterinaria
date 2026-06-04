import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Citas } from './pages/citas/citas';
import { Pacientes } from './pages/pacientes/pacientes';
import { Atencion } from './pages/atencion/atencion';
import { HistoriaClinica } from './pages/historia-clinica/historia-clinica';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'citas', component: Citas },
  { path: 'pacientes', component: Pacientes },
  { path: 'historia-clinica/:idMascota', component: HistoriaClinica },
  { path: 'atencion/:idCita', component: Atencion },
  { path: '**', redirectTo: 'login' }
];
