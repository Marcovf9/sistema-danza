# Epifanía Dance — Sistema de Gestión

> Plataforma ERP completa para la academia de danza Epifanía Dance: gestión de alumnos, clases, cobros, profesores, asistencias y tienda, con portales diferenciados por rol.

**Producción:** [epifaniadanceapp.com](https://epifaniadanceapp.com)

---

## Roles y funcionalidades

### 🎓 Directora
| Módulo | Funcionalidades |
|--------|----------------|
| Dashboard | Métricas en tiempo real: alumnos activos, ingresos del mes, asistencia |
| Alumnos | Alta, edición, baja lógica, historial de pagos, acceso al portal |
| Clases | Crear, editar y eliminar clases; asignar profesores y salones; gestión de disciplinas |
| Profesores | Alta, edición, baja; liquidaciones mensuales; portal docente |
| Caja y Cobros | Registro de pagos, generación de recibos PDF, egresos, historial |
| Asistencias | Vista y registro de asistencias por clase y fecha |
| Calendario | Grilla horaria semanal con todas las clases |
| Tienda | Inventario de productos: crear, editar, dar de baja; control de stock |
| Auditoría | Registro de acciones críticas del sistema |

### 👩‍🏫 Profesor/a
| Módulo | Funcionalidades |
|--------|----------------|
| Mi Agenda | Clases asignadas, sesiones del día |
| Asistencias | Tomar asistencia de sus clases |
| Grilla Horaria | Visualización del calendario semanal |

### 🩰 Alumno/a
| Módulo | Funcionalidades |
|--------|----------------|
| Mi Cuenta | Estado de cuenta, historial de pagos, recibos |
| Mis Clases | Clases inscriptas, horarios |
| Grilla Horaria | Calendario de la academia |
| Tienda | Catálogo y carrito de compras |

---

## Stack tecnológico

### Frontend
- **React 18** + **Vite 8**
- **Tailwind CSS** — diseño responsive con sidebar colapsable en mobile
- **React Router v6** — rutas protegidas por rol (DIRECTOR / PROFESOR / ALUMNO)
- **Axios** — cliente HTTP con interceptor JWT
- **lucide-react** — iconografía
- **react-hot-toast** — notificaciones

### Backend
- **Java 21** + **Spring Boot 3**
- **Spring Security** — autenticación stateless con JWT
- **Spring Data JPA** + **Hibernate**
- **Flyway** — migraciones versionadas (V1–V22)
- **iText** — generación de recibos en PDF
- **JavaMail** — envío de emails (recuperación de contraseña)

### Base de datos
- **MySQL 8.0** (local / Docker)
- **TiDB Cloud** (producción) — serverless, compatible con MySQL

### Infraestructura
| Servicio | Uso |
|----------|-----|
| **Netlify** | Deploy del frontend (SPA) |
| **Render** | Deploy del backend (Docker) |
| **TiDB Cloud** | Base de datos en producción |
| **Cloudinary** | Hosting de imágenes del logo |
| **Gmail SMTP** | Envío de emails transaccionales |

---

## Arquitectura

```
epifaniadanceapp.com (Netlify)
        │
        │  HTTPS → /api/*
        ▼
sistema-danza.onrender.com (Render / Docker)
   Spring Boot :10000
        │
        │  TLS MySQL
        ▼
TiDB Cloud (academia_danza)
```

---

## Configuración local

### Requisitos
- Java 21+
- Node.js 20+
- Docker y Docker Compose

### 1. Clonar el repositorio
```bash
git clone https://github.com/Marcovf9/sistema-danza.git
cd sistema-danza
```

### 2. Variables de entorno
```bash
cp .env.example .env
```

Completar `.env`:
```env
DB_USER=admin
DB_PASSWORD=password123
DB_NAME=academia_danza

JWT_SECRET=<generar con: openssl rand -base64 64>
MAIL_PASSWORD=<app password de Gmail>
APP_FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 3. Levantar con Docker Compose
```bash
docker compose up
```

Esto levanta:
- **MySQL** en `localhost:3306`
- **Backend** en `localhost:8080`
- **Frontend** (nginx) en `localhost:80`

### 4. Desarrollo (frontend + backend por separado)

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
# Corre en :8080. Flyway aplica las migraciones automáticamente.
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local   # o crear manualmente
npm run dev
# Corre en :5173 con proxy hacia :8080
```

`.env.local` mínimo para desarrollo:
```env
VITE_API_URL=http://localhost:8080/api
```

---

## Variables de entorno — Producción

Configurar en el dashboard de **Render** (backend):

| Variable | Descripción |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | Connection string de TiDB Cloud (con `sslMode=VERIFY_IDENTITY`) |
| `SPRING_DATASOURCE_USERNAME` | Usuario de TiDB |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de TiDB |
| `JWT_SECRET` | Clave secreta para firmar tokens (`openssl rand -base64 64`) |
| `MAIL_PASSWORD` | App Password de Gmail |
| `APP_FRONTEND_URL` | `https://epifaniadanceapp.com` |
| `CORS_ALLOWED_ORIGINS` | `https://epifaniadanceapp.com,https://www.epifaniadanceapp.com` |

Configurar en **Netlify** (frontend):

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://sistema-danza.onrender.com/api` |

---

## Migraciones de base de datos

Flyway aplica automáticamente las migraciones al iniciar el backend. Historial:

| Versión | Descripción |
|---------|-------------|
| V1 | Tablas iniciales (usuarios, alumnos, clases, pagos, etc.) |
| V2 | Salones |
| V3 | Datos de prueba iniciales |
| V4 | Grilla de clases Epifanía |
| V5 | Usuario directora |
| V6 | Estado en recibos |
| V7 | Campo activo en profesores |
| V8 | Flag `requiere_cambio_password` |
| V9 | Tabla de egresos |
| V10 | Fecha de liquidación |
| V11 | Tabla de auditoría |
| V12 | Email de alumno |
| V13 | Tabla de productos (tienda) |
| V14 | Tabla de imágenes de productos |
| V15 | Usuario para alumnos |
| V16 | Días en inscripciones |
| V17 | Actualización datos de alumnos |
| V18 | Reestructura tutores |
| V19 | Barrio de alumno |
| V20 | Duración de clase programada |
| V21 | Tabla de tokens de recuperación de contraseña |
| V22 | Setup producción: admin Karina, clases sin profesor nullable |

---

## Estructura del proyecto

```
sistema-danza/
├── backend/                        # Spring Boot
│   ├── src/main/java/.../
│   │   ├── controllers/            # REST endpoints
│   │   ├── models/                 # Entidades JPA
│   │   ├── repositories/           # Spring Data repositories
│   │   ├── services/               # Lógica de negocio
│   │   ├── security/               # JWT + Spring Security
│   │   └── exception/              # Manejo global de errores
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/           # Scripts Flyway (V1–V22)
│   └── Dockerfile
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/              # Dashboard, Alumnos, Caja, Clases, Tienda...
│   │   │   ├── profesor/           # Agenda, Profesores
│   │   │   ├── alumno/             # Portal del alumno
│   │   │   └── auth/               # Login, recuperación de contraseña
│   │   ├── components/
│   │   │   ├── layout/             # LayoutPrincipal (sidebar + outlet)
│   │   │   └── admin/              # Modales reutilizables
│   │   └── services/
│   │       └── api.js              # Axios con interceptor JWT
│   ├── public/
│   │   ├── favicon.png
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── Dockerfile
│
├── docker-compose.yml              # MySQL + backend + frontend
├── netlify.toml                    # Config deploy Netlify
├── render.yaml                     # Config deploy Render
└── .env.example                    # Plantilla de variables de entorno
```

---

## Autenticación

- Login devuelve un **JWT** almacenado en `localStorage`
- Todos los endpoints `/api/**` requieren `Authorization: Bearer <token>` (excepto `/api/auth/**`)
- Contraseña inicial de alumnos: su **DNI** (se fuerza cambio en el primer login)
- Recuperación de contraseña por email (link con token de 1 hora)

---

## Despliegue en producción

1. **TiDB Cloud** — Crear cluster Serverless, obtener connection string
2. **Render** — Nuevo Web Service, Runtime: Docker, Root Directory: `backend`, configurar variables de entorno
3. **Netlify** — Conectar repo, Base directory: `frontend`, Build command: `npm run build`, Publish: `dist`, variable `VITE_API_URL`
4. **Dominio** — Agregar dominio custom en Netlify, actualizar `CORS_ALLOWED_ORIGINS` en Render

---

## Licencia

Proyecto privado — © Epifanía Dance. Todos los derechos reservados.
