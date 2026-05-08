package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.Profesor;
import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.ProfesorRepository;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import com.academia.sistema_danza.security.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado en la base de datos"));

            boolean claveCorrecta = false;
            if (usuario.getPasswordHash().startsWith("$2a$")) {
                claveCorrecta = passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash());
            } else {
                claveCorrecta = usuario.getPasswordHash().equals(request.getPassword());
            }

            if (!claveCorrecta) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
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

    @PostMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String nuevaPassword = request.get("nuevaPassword");
        
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        usuario.setRequiereCambioPassword(false);
        usuarioRepository.save(usuario);
        
        return ResponseEntity.ok("Contraseña actualizada con éxito");
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}