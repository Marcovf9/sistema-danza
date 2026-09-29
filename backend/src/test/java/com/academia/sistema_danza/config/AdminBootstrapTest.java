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

    private ApplicationRunner runner(String email, String password) {
        return new AdminBootstrap().crearDirectoraInicial(usuarios, encoder, email, password);
    }
}
