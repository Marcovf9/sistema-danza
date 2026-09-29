package com.academia.sistema_danza.services;

import com.academia.sistema_danza.dto.AlumnoRequestDTO;
import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.GrupoFamiliarRepository;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlumnoServiceTest {

    @Mock private AlumnoRepository alumnoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private GrupoFamiliarRepository grupoFamiliarRepository;
    @Mock private PasswordResetService passwordResetService;
    @Spy private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    @InjectMocks private AlumnoService alumnoService;

    @Test
    void laCuentaNuevaNoUsaElDniComoContrasenaYRecibeUnEnlaceDeActivacion() {
        AlumnoRequestDTO dto = new AlumnoRequestDTO();
        dto.setNombre("Lucía");
        dto.setApellido("Pérez");
        dto.setDni("40123456");
        dto.setEmail(" lucia@example.com ");
        when(alumnoRepository.save(any(Alumno.class))).thenAnswer(inv -> inv.getArgument(0));

        alumnoService.crearAlumno(dto);

        ArgumentCaptor<Usuario> usuario = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuario.capture());
        assertThat(usuario.getValue().getEmail()).isEqualTo("lucia@example.com");
        assertThat(usuario.getValue().getRol()).isEqualTo(RolUsuario.ALUMNO);
        assertThat(passwordEncoder.matches("40123456", usuario.getValue().getPasswordHash())).isFalse();
        verify(passwordResetService).enviarActivacionCuenta(usuario.getValue());
    }

    @Test
    void sinEmailNoSeCreaCuentaDeAcceso() {
        AlumnoRequestDTO dto = new AlumnoRequestDTO();
        dto.setNombre("Juana");
        dto.setApellido("Pérez");
        dto.setDni("50123456");
        when(alumnoRepository.save(any(Alumno.class))).thenAnswer(inv -> inv.getArgument(0));

        alumnoService.crearAlumno(dto);

        verifyNoInteractions(usuarioRepository, passwordResetService);
    }
}
