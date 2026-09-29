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
 * <p>Si ya hay una directora cargada no hace nada, así que no pisa la contraseña
 * de producción en cada arranque.
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

    private static String passwordAleatoria() {
        byte[] bytes = new byte[12];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
