-- Agrega duración en minutos a cada clase programada.
-- Default 60 min para mantener compatibilidad con los datos existentes.
ALTER TABLE clases_programadas
    ADD COLUMN duracion_minutos INT NOT NULL DEFAULT 60;
