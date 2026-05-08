CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO productos (nombre, descripcion, precio, stock, categoria) 
VALUES ('Remera Epifania Dance (Talle M)', 'Remera de algodón con logo estampado', 15000.00, 20, 'INDUMENTARIA');

INSERT INTO productos (nombre, descripcion, precio, stock, categoria) 
VALUES ('Entrada Muestra Fin de Año', 'Ticket general para el show de diciembre', 8000.00, 150, 'EVENTOS');