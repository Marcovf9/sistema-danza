package com.academia.sistema_danza.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.api.callback.Callback;
import org.flywaydb.core.api.callback.Context;
import org.flywaydb.core.api.callback.Event;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

/**
 * V5 y V22 se editaron para sacar credenciales del repositorio, y V18 para que corra
 * también en MySQL 8 (no solo en TiDB). Una base que ya las aplicó guarda el checksum
 * viejo y Flyway se negaría a arrancar.
 *
 * <p>Antes de validar, este callback actualiza el checksum de esas tres versiones, y
 * solo de esas, al valor de los archivos actuales. Es idempotente y no toca datos: en
 * una base nueva o ya corregida no hace nada. Cualquier otra migración editada por
 * error sigue haciendo fallar el arranque, como corresponde.
 */
@Slf4j
@Component
public class ChecksumsMigracionesEditadas implements Callback {

    /** Checksums de los archivos actuales (los calcula Flyway: CRC32 por línea). */
    static final Map<String, Integer> CHECKSUMS = Map.of(
            "5", 1411376732,
            "18", 387750350,
            "22", -1990904880);

    private static final String TABLA = "flyway_schema_history";

    @Override
    public boolean supports(Event event, Context context) {
        return event == Event.BEFORE_VALIDATE;
    }

    @Override
    public boolean canHandleInTransaction(Event event, Context context) {
        return true;
    }

    @Override
    public void handle(Event event, Context context) {
        Connection conn = context.getConnection();
        try {
            if (!existeTablaHistorial(conn)) {
                return;
            }
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE " + TABLA + " SET checksum = ? WHERE version = ? AND type = 'SQL' AND checksum <> ?")) {
                for (var entry : CHECKSUMS.entrySet()) {
                    ps.setInt(1, entry.getValue());
                    ps.setString(2, entry.getKey());
                    ps.setInt(3, entry.getValue());
                    if (ps.executeUpdate() > 0) {
                        log.warn("Checksum de la migración V{} actualizado al del archivo actual", entry.getKey());
                    }
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("No se pudieron actualizar los checksums de V5/V18/V22", e);
        }
    }

    private static boolean existeTablaHistorial(Connection conn) throws SQLException {
        try (ResultSet rs = conn.getMetaData().getTables(conn.getCatalog(), null, TABLA, new String[]{"TABLE"})) {
            return rs.next();
        }
    }

    @Override
    public String getCallbackName() {
        return "checksums-migraciones-editadas";
    }
}
