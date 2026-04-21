DELETE FROM asistencias;
DELETE FROM sesiones_clases;
DELETE FROM inscripciones;
DELETE FROM clases_programadas;
DELETE FROM disciplinas;

-- ADULTOS
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Árabe', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Clásico Adultos', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Contemporáneo', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Folklore', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Matrodance', 'Adultos/Mixto', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Jazz Adultos', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Street Dance', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Pole Dance Principiantes', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Pole Dance Intermedio', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Ritmos Latinoamericanos', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Salsa y Bachata', 'En Parejas', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Tango', 'Adultos', 25000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Bailoterapia', 'En Silla', 25000.00);

-- NIÑOS
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Iniciación a la Danza', 'Niños', 20000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Clásico Infantil', 'Niños', 20000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Street Dance Teens', 'Adolescentes', 22000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Street Dance Kids', 'Niños', 20000.00);
INSERT INTO disciplinas (nombre, descripcion, precio_base) VALUES ('Jazz Infantil', 'Niños', 20000.00);

-- ADULTOS
INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Árabe'), 1, 1, 'MARTES,JUEVES', '19:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Clásico Adultos'), 1, 1, 'LUNES,MIERCOLES,VIERNES', '19:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Contemporáneo'), 1, 1, 'LUNES,MIERCOLES', '15:30:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Folklore'), 1, 1, 'LUNES,MIERCOLES', '20:30:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Matrodance'), 1, 1, 'MARTES,VIERNES', '17:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Jazz Adultos'), 1, 1, 'MARTES,JUEVES', '18:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Street Dance'), 1, 1, 'LUNES,MIERCOLES', '20:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Pole Dance Principiantes'), 1, 1, 'LUNES,MIERCOLES', '19:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Pole Dance Intermedio'), 1, 1, 'LUNES,MIERCOLES', '20:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Ritmos Latinoamericanos'), 1, 1, 'MARTES,JUEVES', '20:30:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Ritmos Latinoamericanos'), 1, 1, 'MIERCOLES,VIERNES', '09:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Salsa y Bachata'), 1, 1, 'MARTES,JUEVES', '21:30:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Tango'), 1, 1, 'LUNES', '21:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Bailoterapia'), 1, 1, 'MARTES,JUEVES', '16:00:00');

-- NIÑOS
INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Iniciación a la Danza'), 1, 1, 'MARTES,VIERNES', '18:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Clásico Infantil'), 1, 1, 'LUNES,MIERCOLES', '18:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Street Dance Teens'), 1, 1, 'LUNES,MIERCOLES', '18:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Street Dance Kids'), 1, 1, 'LUNES,MIERCOLES', '19:00:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Jazz Infantil'), 1, 1, 'MARTES,JUEVES', '19:30:00');

INSERT INTO clases_programadas (disciplina_id, salon_id, profesor_titular_id, dias_semana, hora_inicio) 
VALUES ((SELECT id FROM disciplinas WHERE nombre = 'Matrodance'), 1, 1, 'MARTES,JUEVES', '17:00:00');