import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { Pacientes } from './Pages/pacientes/pacientes';
import { Atencion } from './Pages/atencion/atencion';


export const routes: Routes = [

   { path: '', component: Layout, children:[
      {path:'pacientes', component: Pacientes},
      { path: 'atencion/:idCita', component: Atencion },
   ]}
];
