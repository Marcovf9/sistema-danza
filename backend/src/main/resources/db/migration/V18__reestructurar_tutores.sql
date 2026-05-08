ALTER TABLE alumnos DROP COLUMN IF EXISTS nombre_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS apellido_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS dni_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS telefono_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS lugar_nacimiento_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS fecha_nacimiento_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS direccion_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS codigo_postal_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS localidad_menor;
ALTER TABLE alumnos DROP COLUMN IF EXISTS provincia_menor;

ALTER TABLE alumnos ADD COLUMN tutor_id BIGINT;
ALTER TABLE alumnos ADD CONSTRAINT fk_alumno_tutor FOREIGN KEY (tutor_id) REFERENCES alumnos(id) ON DELETE SET NULL;