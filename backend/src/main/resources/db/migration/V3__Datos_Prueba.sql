-- 1. Creamos un par de disciplinas con sus precios base
INSERT INTO disciplinas (nombre, descripcion, precio_base) 
VALUES ('Danza Clásica', 'Ballet y técnica clásica', 25000.00);

INSERT INTO disciplinas (nombre, descripcion, precio_base) 
VALUES ('Ritmos Urbanos', 'Reggaeton, Hip Hop y Street Dance', 22000.00);

-- 2. Creamos un usuario y un profesor
INSERT INTO usuarios (email, password_hash, rol) 
VALUES ('profe.ana@academia.com', '123456', 'PROFESOR');

INSERT INTO profesores (usuario_id, nombre, apellido, cbu_alias) 
VALUES (1, 'Ana', 'García', 'ana.danza.mp');

-- 3. Programamos un par de clases en el Salón 1 (id 1) y Salón 2 (id 2)
INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio)
VALUES (1, 1, 1, 'LUNES,MIERCOLES', '18:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio)
VALUES (2, 2, 1, 'MARTES,JUEVES', '19:30:00');