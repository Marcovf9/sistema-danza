CREATE TABLE imagenes_productos (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    datos_imagen TEXT NOT NULL,
    CONSTRAINT fk_imagen_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);