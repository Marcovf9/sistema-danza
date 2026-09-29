package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.dto.RecuperarPasswordRequestDTO;
import com.academia.sistema_danza.dto.ResetearPasswordRequestDTO;
import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.Profesor;
import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.ProfesorRepository;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import com.academia.sistema_danza.security.JwtService;
import com.academia.sistema_danza.services.PasswordResetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final ProfesorRepository profesorRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AlumnoRepository alumnoRepository;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim())
                    .orElseThrow(() -> new RuntimeException("Email o contraseña incorrectos"));

            if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email o contraseña incorrectos");
            }

            Long entidadId = null;
            if ("PROFESOR".equals(usuario.getRol().name())) {
                Profesor profe = profesorRepository.findAll().stream()
                        .filter(p -> p.getUsuarioId() != null && p.getUsuarioId().equals(usuario.getId()))
                        .findFirst().orElse(null);
                if (profe != null) entidadId = profe.getId();
            } else if ("ALUMNO".equals(usuario.getRol().name())) {
                Alumno alumno = alumnoRepository.findAll().stream()
                        .filter(a -> a.getUsuarioId() != null && a.getUsuarioId().equals(usuario.getId()))
                        .findFirst().orElse(null);
                if (alumno != null) entidadId = alumno.getId();
            }

            String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name(), entidadId);

            return ResponseEntity.ok(Map.<String, Object>of(
                    "token", token,
                    "rol", usuario.getRol().name(),
                    "email", usuario.getEmail(),
                    "requiereCambioPassword", usuario.getRequiereCambioPassword(),
                    "entidadId", entidadId != null ? entidadId : "" // Genérico para ambos
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Inicia el flujo de recuperación. Siempre devuelve 200 para no revelar
     * si el email existe en el sistema (prevención de enumeración de usuarios).
     */
    @PostMapping("/recuperar-password")
    public ResponseEntity<String> recuperarPassword(@Valid @RequestBody RecuperarPasswordRequestDTO dto) {
        passwordResetService.solicitarReset(dto.getEmail());
        return ResponseEntity.ok("Si el email está registrado, recibirás un enlace para restablecer tu contraseña.");
    }

    @PostMapping("/resetear-password")
    public ResponseEntity<String> resetearPassword(@Valid @RequestBody ResetearPasswordRequestDTO dto) {
        passwordResetService.resetearPassword(dto.getToken(), dto.getNuevaPassword());
        return ResponseEntity.ok("Contraseña actualizada con éxito. Ya podés iniciar sesión.");
    }

    /**
     * Cambia la contraseña del usuario autenticado. El email sale del JWT, no del
     * body, para que nadie pueda cambiar la contraseña de otra cuenta.
     */
    @PostMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(Principal principal, @RequestBody Map<String, String> request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sesión no válida");
        }
        String nuevaPassword = request.get("nuevaPassword");
        if (nuevaPassword == null || nuevaPassword.length() < 8) {
            return ResponseEntity.badRequest().body("La contraseña debe tener al menos 8 caracteres");
        }

        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElseThrow();
        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        usuario.setRequiereCambioPassword(false);
        usuarioRepository.save(usuario);
        
        return ResponseEntity.ok("Contraseña actualizada con éxito");
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        private String email;

        @NotBlank(message = "La contraseña es obligatoria")
        private String password;
    }
}