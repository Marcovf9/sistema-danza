package com.academia.sistema_danza.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI epifaniaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Epifania Dance ERP — API")
                        .description("""
                                API REST del sistema de gestión para academia de danza Epifania.

                                **Roles disponibles:**
                                - `DIRECTOR` — Acceso total (caja, alumnos, profesores, dashboard)
                                - `PROFESOR` — Agenda y registro de asistencia
                                - `ALUMNO` — Portal de autogestión (cuenta, clases, tienda)

                                Para autenticarte: usá `POST /api/auth/login`, copiá el `token`
                                y pegalo en el botón **Authorize** (formato: `Bearer <token>`).
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Epifania Dance")
                                .email("epifaniadanceart@gmail.com")))
                // Esquema JWT: los endpoints protegidos requieren "Bearer <token>"
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Pegá el token JWT obtenido del endpoint /api/auth/login")));
    }
}
