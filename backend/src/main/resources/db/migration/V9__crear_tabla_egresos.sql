CREATE TABLE egresos (
    id BIGSERIAL PRIMARY KEY,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    observaciones VARCHAR(500)
);