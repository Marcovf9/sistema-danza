package com.academia.sistema_danza.config;

import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminBootstrapTest {

    private final UsuarioRepository usuarios = mock(UsuarioRepository.class);
    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @Test
    void creaLaDirectoraConLasCredencialesDeLasVariablesDeEntorno() throws Exception {
        when(usuarios.existsByRol(RolUsuario.DIRECTOR)).thenReturn(false);

        runner("directora@example.com", "S3creta-de-prueba").run(null);

        ArgumentCaptor<Usuario> guardado = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarios).save(guardado.capture());
        Usuario directora = guardado.getValue();
        assertThat(directora.getEmail()).isEqualTo("directora@example.com");
        assertThat(directora.getRol()).isEqualTo(RolUsuario.DIRECTOR);
        assertThat(directora.getPasswordHash()).startsWith("$2").isNotEqualTo("S3creta-de-prueba");
        assertThat(encoder.matches("S3creta-de-prueba", directora.getPasswordHash())).isTrue();
        assertThat(directora.getRequiereCambioPassword()).isFalse();
    }

    @Test
    void sinAdminPasswordGeneraUnaAleatoriaYObligaACambiarla() throws Exception {
        when(usuarios.existsByRol(RolUsuario.DIRECTOR)).thenReturn(false);

        runner("directora@example.com", "").run(null);

        ArgumentCaptor<Usuario> guardado = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarios).save(guardado.capture());
        assertThat(guardado.getValue().getPasswordHash()).startsWith("$2");
        assertThat(guardado.getValue().getRequiereCambioPassword()).isTrue();
    }

    @Test
    void noTocaNadaSiYaExisteUnaDirectora() throws Exception {
        when(usuarios.existsByRol(RolUsuario.DIRECTOR)).thenReturn(true);

        runner("directora@example.com", "otra").run(null);

        verify(usuarios, never()).save(any());
    }

    @Test
    void siLaDirectoraExistenteTieneLaContrasenaEnTextoPlanoSeLeAsignaUnaNueva() throws Exception {
        Usuario heredada = Usuario.builder().email("admin@gmail.com").passwordHash("admin123")
                .rol(RolUsuario.DIRECTOR).requiereCambioPassword(false).build();
        when(usuarios.existsByRol(RolUsuario.DIRECTOR)).thenReturn(true);
        when(usuarios.findByRol(RolUsuario.DIRECTOR)).thenReturn(java.util.List.of(heredada));

        runner("directora@example.com", "S3creta-de-prueba").run(null);

        verify(usuarios).save(heredada);
        assertThat(heredada.getEmail()).isEqualTo("admin@gmail.com");
        assertThat(encoder.matches("S3creta-de-prueba", heredada.getPasswordHash())).isTrue();
        assertThat(heredada.getRequiereCambioPassword()).isTrue();
    }

    @Test
    void noTocaUnaDirectoraQueYaTieneHashBcrypt() throws Exception {
        Usuario actual = Usuario.builder().email("directora@example.com").passwordHash(encoder.encode("vigente"))
                .rol(RolUsuario.DIRECTOR).build();
        when(usuarios.existsByRol(RolUsuario.DIRECTOR)).thenReturn(true);
        when(usuarios.findByRol(RolUsuario.DIRECTOR)).thenReturn(java.util.List.of(actual));

        runner("directora@example.com", "otra").run(null);

        verify(usuarios, never()).save(any());
        assertThat(encoder.matches("vigente", actual.getPasswordHash())).isTrue();
    }

    private ApplicationRunner runner(String email, String password) {
        return new AdminBootstrap().crearDirectoraInicial(usuarios, encoder, email, password);
    }
}
