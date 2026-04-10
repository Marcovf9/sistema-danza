-- 1. Tipos de Datos Personalizados (Enums)
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'PROFESOR', 'ALUMNO');
CREATE TYPE estado_asistencia AS ENUM ('PRESENTE', 'AUSENTE', 'RECUPERA');
CREATE TYPE concepto_pago AS ENUM ('CUOTA', 'MATRICULA', 'VESTUARIO', 'MERIENDA');
CREATE TYPE metodo_pago AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_CREDITO');

-- 2. Módulo de Personas y Accesos
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alumnos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    contacto_emergencia VARCHAR(150),
    grupo_familiar_id BIGINT,
    fecha_ultimo_pago_matricula DATE
);

CREATE TABLE profesores (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    cbu_alias VARCHAR(100),
    tarifa_plana_base NUMERIC(10, 2) NOT NULL
);

-- 3. Módulo de Estructura Académica
CREATE TABLE salones (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    capacidad_maxima INT NOT NULL
);

CREATE TABLE disciplinas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE clases_programadas (
    id BIGSERIAL PRIMARY KEY,
    disciplina_id BIGINT REFERENCES disciplinas(id),
    profesor_id BIGINT REFERENCES profesores(id),
    salon_id BIGINT REFERENCES salones(id),
    dia_semana VARCHAR(15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    valor_cuota_base NUMERIC(10, 2) NOT NULL
);

-- 4. Módulo de Cursada y Asistencia
CREATE TABLE inscripciones (
    id BIGSERIAL PRIMARY KEY,
    alumno_id BIGINT REFERENCES alumnos(id) ON DELETE CASCADE,
    clase_programada_id BIGINT REFERENCES clases_programadas(id) ON DELETE CASCADE,
    fecha_alta DATE DEFAULT CURRENT_DATE,
    UNIQUE(alumno_id, clase_programada_id)
);

CREATE TABLE asistencias (
    id BIGSERIAL PRIMARY KEY,
    clase_programada_id BIGINT REFERENCES clases_programadas(id),
    alumno_id BIGINT REFERENCES alumnos(id),
    fecha DATE NOT NULL,
    estado estado_asistencia NOT NULL,
    profesor_reemplazo_id BIGINT REFERENCES profesores(id) NULL
);

-- 5. Módulo Financiero
CREATE TABLE pagos_alumnos (
    id BIGSERIAL PRIMARY KEY,
    alumno_id BIGINT REFERENCES alumnos(id),
    monto_total NUMERIC(10, 2) NOT NULL,
    concepto concepto_pago NOT NULL,
    metodo_pago metodo_pago NOT NULL,
    fecha_pago DATE NOT NULL,
    dias_mora INT DEFAULT 0,
    recargo_aplicado NUMERIC(10, 2) DEFAULT 0.00
);

CREATE TABLE liquidacion_profesores (
    id BIGSERIAL PRIMARY KEY,
    profesor_id BIGINT REFERENCES profesores(id),
    mes INT NOT NULL,
    anio INT NOT NULL,
    clases_dadas INT DEFAULT 0,
    alumnos_extra INT DEFAULT 0,
    descuentos_por_reemplazo NUMERIC(10, 2) DEFAULT 0.00,
    total_a_pagar NUMERIC(10, 2) NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_liquidacion DATE DEFAULT CURRENT_DATE
);