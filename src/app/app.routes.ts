import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { Pacientes } from './pages/pacientes/pacientes';

export const routes: Routes = [

   { path: '', component: Layout, children:[
      {path:'pacientes', component: Pacientes},
   ]}
];
