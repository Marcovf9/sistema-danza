package com.academia.sistema_danza.config;

import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Crea el usuario DIRECTOR inicial cuando todavía no existe ninguno.
 *
 * <p>Las credenciales nunca se versionan: se toman de ADMIN_EMAIL y ADMIN_PASSWORD.
 * Si ADMIN_PASSWORD no está definida se genera una al azar, se imprime una única
 * vez en el log y se fuerza el cambio en el primer login.
 *
 * <p>Si ya hay una directora cargada no pisa su contraseña, salvo que esté guardada
 * en texto plano (ver {@link #reemplazarPasswordsEnTextoPlano}).
 */
@Slf4j
@Configuration
public class AdminBootstrap {

    @Bean
    ApplicationRunner crearDirectoraInicial(UsuarioRepository usuarios, PasswordEncoder encoder,
            @Value("${ADMIN_EMAIL:admin@localhost}") String email,
            @Value("${ADMIN_PASSWORD:}") String passwordConfigurada) {

        return args -> {
            if (usuarios.existsByRol(RolUsuario.DIRECTOR)) {
                reemplazarPasswordsEnTextoPlano(usuarios, encoder, passwordConfigurada);
                return;
            }

            boolean generada = passwordConfigurada == null || passwordConfigurada.isBlank();
            String password = generada ? passwordAleatoria() : passwordConfigurada;

            usuarios.save(Usuario.builder()
                    .email(email.trim())
                    .passwordHash(encoder.encode(password))
                    .rol(RolUsuario.DIRECTOR)
                    .requiereCambioPassword(generada)
                    .build());

            if (generada) {
                log.warn("""

                        ===========================================================
                         Usuario DIRECTOR inicial creado
                           email:      {}
                           contraseña: {}
                         Guardala ahora: no vuelve a mostrarse.
                         En producción definí ADMIN_EMAIL y ADMIN_PASSWORD.
                        ===========================================================
                        """, email, password);
            } else {
                log.info("Usuario DIRECTOR inicial creado a partir de ADMIN_EMAIL/ADMIN_PASSWORD: {}", email);
            }
        };
    }

    /**
     * Una base que se quedó en V21 conserva la directora que insertaba la V5 original,
     * con la contraseña en texto plano. El login solo acepta BCrypt, así que esa cuenta
     * quedaría inutilizable: se le asigna ADMIN_PASSWORD (o una aleatoria que se muestra
     * una vez en el log) y se fuerza el cambio en el primer ingreso.
     */
    private static void reemplazarPasswordsEnTextoPlano(UsuarioRepository usuarios, PasswordEncoder encoder,
            String passwordConfigurada) {
        for (Usuario directora : usuarios.findByRol(RolUsuario.DIRECTOR)) {
            if (directora.getPasswordHash() != null && directora.getPasswordHash().startsWith("$2")) {
                continue;
            }
            boolean generada = passwordConfigurada == null || passwordConfigurada.isBlank();
            String password = generada ? passwordAleatoria() : passwordConfigurada;
            directora.setPasswordHash(encoder.encode(password));
            directora.setRequiereCambioPassword(true);
            usuarios.save(directora);

            if (generada) {
                log.warn("""

                        ===========================================================
                         La directora {} tenía la contraseña en texto plano.
                         Nueva contraseña temporal: {}
                         Guardala ahora: no vuelve a mostrarse.
                        ===========================================================
                        """, directora.getEmail(), password);
            } else {
                log.warn("La directora {} tenía la contraseña en texto plano; se reemplazó por ADMIN_PASSWORD",
                        directora.getEmail());
            }
        }
    }

    private static String passwordAleatoria() {
        byte[] bytes = new byte[12];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
