-- ── V22: Setup inicial de producción ──────────────────────────────────────────
-- 1. Eliminar datos de prueba (profesora Ana)
-- 2. Permitir clases sin profesor asignado
-- 3. Actualizar credenciales del usuario administrador

SET foreign_key_checks = 0;

-- Limpiar sesiones y asistencias de prueba vinculadas a la profesora Ana (id=1)
DELETE FROM asistencias
WHERE sesion_clase_id IN (SELECT id FROM sesiones_clases WHERE profesor_dictante_id = 1);

DELETE FROM sesiones_clases WHERE profesor_dictante_id = 1;

DELETE FROM liquidaciones_profesores WHERE profesor_id = 1;

-- Permitir NULL en clases_programadas.profesor_titular_id
ALTER TABLE clases_programadas
    DROP FOREIGN KEY fk_clase_profesor,
    MODIFY COLUMN profesor_titular_id BIGINT NULL;

-- Quitar asignación de profesora a todas las clases
UPDATE clases_programadas SET profesor_titular_id = NULL;

-- Volver a agregar FK como nullable
ALTER TABLE clases_programadas
    ADD CONSTRAINT fk_clase_profesor
    FOREIGN KEY (profesor_titular_id) REFERENCES profesores(id);

-- Eliminar profesora Ana
DELETE FROM profesores WHERE id = 1;

-- Eliminar usuario de Ana
DELETE FROM usuarios WHERE email = 'profe.ana@academia.com';

-- Actualizar credenciales del administrador
UPDATE usuarios
SET email         = 'karina.faraon@gmail.com',
    password_hash = '$2b$10$A53KHp6Lm38RU.09LmjasOBT2h8EDXFMEAWAn/NMm02t7/JjUh3uK'
WHERE email = 'admin@gmail.com';

SET foreign_key_checks = 1;
