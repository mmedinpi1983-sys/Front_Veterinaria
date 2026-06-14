import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { Pacientes } from './Pages/pacientes/pacientes';
import { Citas } from './Pages/citas/citas';

export const routes: Routes = [

   { path: '', component: Layout, children:[
      {path:'pacientes', component: Pacientes},
      { path: 'citas', component: Citas }, 
   ]}
];
