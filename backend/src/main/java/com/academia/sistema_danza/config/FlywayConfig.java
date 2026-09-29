package com.academia.sistema_danza.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * V5 y V22 se editaron para sacar credenciales del repositorio (y V18 para que
 * corra también en MySQL 8, no solo en TiDB), así que una base
 * que ya las aplicó guarda un checksum distinto y Flyway se niega a arrancar.
 *
 * <p>Con FLYWAY_REPAIR_ON_START=true se ejecuta {@code flyway repair} antes de migrar,
 * que realinea esos checksums sin tocar datos. Pensado para un único deploy:
 * después conviene quitar la variable para que Flyway vuelva a detectar cambios
 * accidentales en migraciones ya aplicadas.
 */
@Slf4j
@Configuration
public class FlywayConfig {

    @Bean
    FlywayMigrationStrategy flywayMigrationStrategy(
            @Value("${FLYWAY_REPAIR_ON_START:false}") boolean repairOnStart) {
        return flyway -> {
            if (repairOnStart) {
                log.warn("FLYWAY_REPAIR_ON_START=true: ejecutando flyway repair antes de migrar");
                flyway.repair();
            }
            flyway.migrate();
        };
    }
}
