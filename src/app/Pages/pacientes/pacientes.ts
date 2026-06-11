import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


const API = 'http://localhost:8080';

@Component({
  selector: 'app-pacientes',
  imports: [RouterLink],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css',
})
export class Pacientes {

  pacientes: any[] = [];
  pacientesPaginados: any[] = [];

  busqueda = '';
  filtroEspecie = '';
  busquedaTimeout: any;

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  modalNuevoVisible = false;
  modalEditarVisible = false;

  // Datos de EspecieRaza cargados desde la BD
  especiesRazas: any[] = [];
  especies: any[] = [];       // Registros con idEspecie = null (Perro, Gato, etc.)
  razasFiltradas: any[] = []; // Razas de la especie seleccionada

  // Autocomplete de raza
  razaInput = '';             // Texto escrito por el usuario
  mostrarRazas = false;       // Controla visibilidad del dropdown de razas
  razaTimeout: any;

  nuevo = {
    nombre: '', idEspecie: null as any, idRaza: null as any,
    sexo: '', tamanio: '', edad: '', notas: '',
    nombreDueno: '', apellidoDueno: '', dni: '', email: '', telefono: ''
  };
  
 






}
