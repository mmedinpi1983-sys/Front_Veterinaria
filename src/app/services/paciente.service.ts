import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


const API = 'http://localhost:8080';

//Servicio de pacientes - gestiona dueños y el vinculo entre dueño y mascota

@Injectable({ providedIn: 'root'})

export class PacienteService {
    constructor(private http: HttpClient){}

    //Lista todos los dueños activos
    getDuenos(): Observable<any> {
        return this.http.get(`${API}/api/dueno`);
    }

    














}