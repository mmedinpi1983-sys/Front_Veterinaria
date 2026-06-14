import { Routes } from '@angular/router';
import { Pacientes } from './Pages/pacientes/pacientes';
import { Layout } from './shared/components/layout/layout';

export const routes: Routes = [

      {
    path: '',
    component: Layout,                                          // Layout con sidebar + topbar
    children: [
      { path: 'pacientes', component: Pacientes },             // Gestión de pacientes
    ]
  },

];
