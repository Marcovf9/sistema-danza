# Epifanía Dance — Management System

> Full ERP platform for the Epifanía Dance school: student, class, payment, teacher, attendance and shop management, with role-specific portals.

**Production:** [epifaniadanceapp.com](https://epifaniadanceapp.com) — in daily use by the school's director, teachers and students.

![Director dashboard](docs/screenshots/dashboard.png)

| Cash desk: pending receipts and checkout | Teacher payouts |
|---|---|
| ![Cash desk](docs/screenshots/caja.png) | ![Teacher payouts](docs/screenshots/profesores.png) |
| **Weekly timetable** | **Student directory** |
| ![Timetable](docs/screenshots/calendario.png) | ![Students](docs/screenshots/alumnos.png) |

<sub>Screenshots taken from a local instance loaded with fictitious data; no real student data is shown.</sub>

---

## Roles and features

### 🎓 Director
| Module | Features |
|--------|----------|
| Dashboard | Real-time metrics: active students, monthly revenue, attendance |
| Students | Create, edit, soft-delete, payment history, portal access |
| Classes | Create, edit and delete classes; assign teachers and studios; discipline management |
| Teachers | Create, edit, deactivate; monthly payouts; teacher portal |
| Cash & Payments | Payment logging, PDF receipt generation, expenses, history |
| Attendance | View and record attendance by class and date |
| Calendar | Weekly timetable grid with every class |
| Shop | Product inventory: create, edit, deactivate; stock control |
| Audit log | Record of critical system actions |

### 👩‍🏫 Teacher
| Module | Features |
|--------|----------|
| My Schedule | Assigned classes, sessions for the day |
| Attendance | Take attendance for their own classes |
| Timetable | Weekly calendar view |

### 🩰 Student
| Module | Features |
|--------|----------|
| My Account | Account status, payment history, receipts |
| My Classes | Enrolled classes, schedules |
| Timetable | School calendar |
| Shop | Catalogue and shopping cart |

---

## Tech stack

### Frontend
- **React 18** + **Vite 8**
- **Tailwind CSS** — responsive design with a collapsible sidebar on mobile
- **React Router v6** — role-protected routes (DIRECTOR / TEACHER / STUDENT)
- **Axios** — HTTP client with JWT interceptor
- **lucide-react** — iconography
- **react-hot-toast** — notifications

### Backend
- **Java 21** + **Spring Boot 3**
- **Spring Security** — stateless authentication with JWT
- **Spring Data JPA** + **Hibernate**
- **Flyway** — versioned migrations (V1–V22)
- **iText** — PDF receipt generation
- **JavaMail** — email delivery (password recovery)

### Database
- **MySQL 8.0** (local / Docker)
- **TiDB Cloud** (production) — serverless, MySQL-compatible

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Netlify** | Frontend deployment (SPA) |
| **Render** | Backend deployment (Docker) |
| **TiDB Cloud** | Production database |
| **Cloudinary** | Logo image hosting |
| **Gmail SMTP** | Transactional email delivery |

---

## Architecture

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

## Local setup

### Requirements
- Java 21+
- Node.js 20+
- Docker and Docker Compose

### 1. Clone the repository
```bash
git clone https://github.com/Marcovf9/sistema-danza.git
cd sistema-danza
```

### 2. Environment variables
```bash
cp .env.example .env
```

Fill in `.env`:
```env
DB_USER=admin
DB_PASSWORD=password123
DB_NAME=academia_danza

JWT_SECRET=<generate with: openssl rand -base64 64>
MAIL_PASSWORD=<Gmail app password>
ADMIN_EMAIL=directora@example.com
ADMIN_PASSWORD=<initial director password>
APP_FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 3. Start with Docker Compose
```bash
docker compose up
```

This spins up:
- **MySQL** on `localhost:3306`
- **Backend** on `localhost:8080`
- **Frontend** (nginx) on `localhost:80`

On first start, if there is no DIRECTOR user yet, the backend creates one from `ADMIN_EMAIL` and
`ADMIN_PASSWORD`. Leave `ADMIN_PASSWORD` empty and it generates a random password, prints it once in
the backend log and forces a change on first login. No credentials live in the migrations.

### 4. Development (frontend and backend separately)

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
# Runs on :8080. Flyway applies migrations automatically.
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create it manually
npm run dev
# Runs on :5173 with a proxy to :8080
```

Minimum `.env.local` for development:
```env
VITE_API_URL=http://localhost:8080/api
```

---

## Environment variables — Production

Set in the **Render** dashboard (backend):

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | TiDB Cloud connection string (with `sslMode=VERIFY_IDENTITY`) |
| `SPRING_DATASOURCE_USERNAME` | TiDB username |
| `SPRING_DATASOURCE_PASSWORD` | TiDB password |
| `JWT_SECRET` | Secret key for signing tokens (`openssl rand -base64 64`) |
| `MAIL_PASSWORD` | Gmail app password |
| `APP_FRONTEND_URL` | `https://epifaniadanceapp.com` |
| `CORS_ALLOWED_ORIGINS` | `https://epifaniadanceapp.com,https://www.epifaniadanceapp.com` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial director account. Only used when no DIRECTOR exists, so it never overwrites the live password |

Set in **Netlify** (frontend):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://sistema-danza.onrender.com/api` |

---

## Database migrations

Flyway applies migrations automatically when the backend starts. V5, V18 and V22 were edited after
being applied (to remove credentials and to make V18 run on MySQL 8); `ChecksumsMigracionesEditadas`
updates their stored checksums on startup, so existing databases keep booting. Any other edited
migration still fails validation. History:

| Version | Description |
|---------|-------------|
| V1 | Initial tables (users, students, classes, payments, etc.) |
| V2 | Studios |
| V3 | Initial seed data |
| V4 | Epifanía class grid |
| V5 | *(emptied)* Used to seed the director; now handled by `AdminBootstrap` from environment variables |
| V6 | Status field on receipts |
| V7 | `active` field on teachers |
| V8 | `requires_password_change` flag |
| V9 | Expenses table |
| V10 | Payout date |
| V11 | Audit table |
| V12 | Student email |
| V13 | Products table (shop) |
| V14 | Product images table |
| V15 | User accounts for students |
| V16 | Days on enrolments |
| V17 | Student data update |
| V18 | Guardian restructure (student ↔ guardian relationship) |
| V19 | Student neighbourhood |
| V20 | Scheduled class duration |
| V21 | Password recovery tokens table |
| V22 | Production setup: remove seed teacher, nullable teacher on classes |

---

## Project structure

```
sistema-danza/
├── backend/                        # Spring Boot
│   ├── src/main/java/.../
│   │   ├── controllers/            # REST endpoints
│   │   ├── models/                 # JPA entities
│   │   ├── repositories/           # Spring Data repositories
│   │   ├── services/               # Business logic
│   │   ├── security/               # JWT + Spring Security
│   │   └── exception/              # Global error handling
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/           # Flyway scripts (V1–V22)
│   └── Dockerfile
│
├── frontend/                       # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/              # Dashboard, Students, Cash, Classes, Shop...
│   │   │   ├── profesor/           # Schedule, Teachers
│   │   │   ├── alumno/             # Student portal
│   │   │   └── auth/               # Login, password recovery
│   │   ├── components/
│   │   │   ├── layout/             # Main layout (sidebar + outlet)
│   │   │   └── admin/              # Reusable modals
│   │   └── services/
│   │       └── api.js              # Axios with JWT interceptor
│   ├── public/
│   │   ├── favicon.png
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── Dockerfile
│
├── docker-compose.yml              # MySQL + backend + frontend
├── netlify.toml                    # Netlify deployment config
├── render.yaml                     # Render deployment config
└── .env.example                    # Environment variable template
```

---

## Authentication

- Login returns a **JWT** stored in `localStorage`
- All `/api/**` endpoints require `Authorization: Bearer <token>` (except `/api/auth/**`)
- Passwords are stored with **BCrypt**; there is no plain-text fallback
- `POST /api/auth/cambiar-password` takes the account from the JWT, never from the request body
- New student accounts get a **random password nobody knows** and a welcome email with a link
  (valid for 72 hours) to choose their own
- Password recovery by email (link with a 1-hour token)

**Why not use the national ID (DNI) as the initial password?** An earlier version did, with a
forced change on first login. The DNI is not a secret: it appears on enrolment forms, receipts and
attendance sheets, and for minors it is known to the whole family. Anyone holding it could log in
before the student did, and "forced change on first login" does not help if the first login is not
the student's. The activation link reuses the existing password-reset flow, so it added no new
moving parts, and a student who misses the email can use *Forgot your password?* at any time.

---

## Tests

```bash
cd backend
./mvnw test          # unit tests only need a JDK
./mvnw verify        # also runs contextLoads, which applies every migration to MySQL
```

The unit tests cover the business rules that move money, using Mockito, with no database:

| Suite | What it pins down |
|-------|-------------------|
| `CajaServiceTest` | Monthly fee = sum of active disciplines; family discount 10% (2 members) / 20% (3+); no duplicate or overwritten receipt when the month is already paid; +10% card surcharge; a receipt can't be charged twice |
| `ProfesorServiceTest` | Teacher payout: 5,000 per class taught plus 40% of the discipline fee for each student present above six; paying a payout records both the settlement and the cash expense |
| `FacturacionAutomaticaServiceTest` | 5% late fee only on the current month's pending receipts; reminders for minors go to the guardian |
| `AlumnoServiceTest` | New student accounts never use the DNI as password and get an activation email |
| `AdminBootstrapTest` | Initial director created from env vars, random password when unset, existing director left untouched |

CI (GitHub Actions) runs `mvn verify` against a MySQL 8 service container and builds the frontend.

---

## Production deployment

1. **TiDB Cloud** — Create a Serverless cluster, get the connection string
2. **Render** — New Web Service, Runtime: Docker, Root Directory: `backend`, set the environment variables
3. **Netlify** — Connect the repo, Base directory: `frontend`, Build command: `npm run build`, Publish: `dist`, set `VITE_API_URL`
4. **Domain** — Add the custom domain in Netlify, update `CORS_ALLOWED_ORIGINS` in Render

---

## Licence

The source code is public so it can be read and reviewed as part of my portfolio, but it is **not
open source**: no licence is granted to copy, modify or redistribute it. © Marco Vergara Faraon.
The Epifanía Dance name and logo belong to the school.
