# VetClinic - Frontend

Sistema de gestión veterinaria desarrollado con **Angular 21**.

---

## Requisitos previos

Instalar los siguientes programas antes de levantar el sistema:

| Programa | Versión | Descarga |
|----------|---------|----------|
| Node.js | 18 o superior | https://nodejs.org |
| Angular CLI | Última versión | Se instala con el comando de abajo |
| Visual Studio Code | Última versión | https://code.visualstudio.com |

### Instalar Angular CLI
Después de instalar Node.js, abrir una terminal y ejecutar:
```bash
npm install -g @angular/cli
```

---

## Importante

El frontend requiere que el **backend esté corriendo** antes de iniciarlo.
Seguir primero las instrucciones del repositorio del backend:
https://github.com/richardespinozaj-afk/Backend_VetClinic

---

## Levantar el frontend

1. Clonar el repositorio:
```bash
git clone https://github.com/richardespinozaj-afk/Frontend_VetClinic.git
```

2. Abrir la carpeta en **Visual Studio Code**

3. Abrir una terminal en VS Code (`Ctrl + \``) y ejecutar:
```bash
npm install
```

4. Una vez instaladas las dependencias, ejecutar:
```bash
ng serve
```

5. Esperar hasta ver el mensaje:
```
Application bundle generation complete.
```

6. Abrir el navegador en: `http://localhost:4200`

---

## Credenciales de acceso

| Campo | Valor |
|-------|-------|
| Correo | admin@vetclinic.com |
| Contraseña | admin123 |

---

## Módulos disponibles

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Login | `/login` | Inicio de sesión |
| Gestión de Citas | `/citas` | Agendar, reprogramar y cancelar citas |
| Gestión de Pacientes | `/pacientes` | Registro de mascotas y propietarios |
| Historia Clínica | `/historia-clinica/:id` | Expediente del paciente |
| Atención Clínica | `/atencion/:idCita` | Flujo: triaje → anamnesis → consulta → receta |

---

## Tecnologías utilizadas

- Angular 21
- TypeScript
- SweetAlert2
- HTML / CSS

---

## Repositorio Backend

https://github.com/richardespinozaj-afk/Backend_VetClinic
