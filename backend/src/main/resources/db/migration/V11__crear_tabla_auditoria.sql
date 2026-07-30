CREATE TABLE auditoria_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha TIMESTAMP NOT NULL,
    usuario_email VARCHAR(255) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    entidad_afectada VARCHAR(100) NOT NULL,
    entidad_id BIGINT,
    detalles TEXT
);