-- 0. SEGURIDAD
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. PERSONAS Y DESCUENTOS
CREATE TABLE grupos_familiares (
    id BIGSERIAL PRIMARY KEY,
    nombre_referencia VARCHAR(255) NOT NULL
);

CREATE TABLE alumnos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(50),
    contacto_emergencia VARCHAR(150),
    fecha_vencimiento_matricula DATE,
    grupo_familiar_id BIGINT,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_alumno_grupo_familiar FOREIGN KEY (grupo_familiar_id) REFERENCES grupos_familiares(id) ON DELETE SET NULL
);

CREATE TABLE profesores (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT, 
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cbu_alias VARCHAR(255)
);

-- 2. OPERATIVA FÍSICA
CREATE TABLE salones (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    aforo_maximo INT NOT NULL
);

CREATE TABLE disciplinas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    precio_base DECIMAL(10, 2)
);

CREATE TABLE clases_programadas (
    id BIGSERIAL PRIMARY KEY,
    disciplina_id BIGINT NOT NULL,
    salon_id BIGINT NOT NULL,
    profesor_titular_id BIGINT NOT NULL,
    dias_semana VARCHAR(100) NOT NULL, 
    hora_inicio TIME NOT NULL,
    CONSTRAINT fk_clase_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    CONSTRAINT fk_clase_salon FOREIGN KEY (salon_id) REFERENCES salones(id),
    CONSTRAINT fk_clase_profesor FOREIGN KEY (profesor_titular_id) REFERENCES profesores(id)
);

CREATE TABLE inscripciones (
    id BIGSERIAL PRIMARY KEY,
    alumno_id BIGINT NOT NULL,
    clase_programada_id BIGINT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_inscripcion_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    CONSTRAINT fk_inscripcion_clase FOREIGN KEY (clase_programada_id) REFERENCES clases_programadas(id)
);

CREATE TABLE sesiones_clases (
    id BIGSERIAL PRIMARY KEY,
    clase_programada_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    profesor_dictante_id BIGINT NOT NULL,
    CONSTRAINT fk_sesion_clase FOREIGN KEY (clase_programada_id) REFERENCES clases_programadas(id),
    CONSTRAINT fk_sesion_profesor FOREIGN KEY (profesor_dictante_id) REFERENCES profesores(id)
);

CREATE TABLE asistencias (
    id BIGSERIAL PRIMARY KEY,
    sesion_clase_id BIGINT NOT NULL,
    alumno_id BIGINT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    CONSTRAINT fk_asistencia_sesion FOREIGN KEY (sesion_clase_id) REFERENCES sesiones_clases(id),
    CONSTRAINT fk_asistencia_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

-- 3. FINANCIERO (CAJA Y PAGOS)
CREATE TABLE recibos (
    id BIGSERIAL PRIMARY KEY,
    alumno_id BIGINT, 
    fecha_emision TIMESTAMP NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_recibo_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
);

CREATE TABLE detalles_recibo (
    id BIGSERIAL PRIMARY KEY,
    recibo_id BIGINT NOT NULL,
    tipo_concepto VARCHAR(50) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    mes_imputacion VARCHAR(7), 
    CONSTRAINT fk_detalle_recibo FOREIGN KEY (recibo_id) REFERENCES recibos(id) ON DELETE CASCADE
);

CREATE TABLE liquidaciones_profesores (
    id BIGSERIAL PRIMARY KEY,
    profesor_id BIGINT NOT NULL,
    mes INT NOT NULL,
    anio INT NOT NULL,
    total_base DECIMAL(10, 2) NOT NULL,
    total_comisiones DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    CONSTRAINT fk_liquidacion_profesor FOREIGN KEY (profesor_id) REFERENCES profesores(id)
);