ALTER TABLE alumnos DROP COLUMN nombre_menor;
ALTER TABLE alumnos DROP COLUMN apellido_menor;
ALTER TABLE alumnos DROP COLUMN dni_menor;
ALTER TABLE alumnos DROP COLUMN telefono_menor;
ALTER TABLE alumnos DROP COLUMN lugar_nacimiento_menor;
ALTER TABLE alumnos DROP COLUMN fecha_nacimiento_menor;
ALTER TABLE alumnos DROP COLUMN direccion_menor;
ALTER TABLE alumnos DROP COLUMN codigo_postal_menor;
ALTER TABLE alumnos DROP COLUMN localidad_menor;
ALTER TABLE alumnos DROP COLUMN provincia_menor;

ALTER TABLE alumnos ADD COLUMN tutor_id BIGINT;
ALTER TABLE alumnos ADD CONSTRAINT fk_alumno_tutor FOREIGN KEY (tutor_id) REFERENCES alumnos(id) ON DELETE SET NULL;