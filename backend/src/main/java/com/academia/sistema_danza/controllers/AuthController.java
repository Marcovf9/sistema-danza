package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Profesor;
import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.repositories.ProfesorRepository;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import com.academia.sistema_danza.security.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado en la base de datos"));

            if (!usuario.getPasswordHash().equals(request.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
            }

            Long profesorId = null;
            if ("PROFESOR".equals(usuario.getRol().name())) {
                Profesor profe = profesorRepository.findAll().stream()
                        .filter(p -> p.getUsuarioId() != null && p.getUsuarioId().equals(usuario.getId()))
                        .findFirst()
                        .orElse(null);
                if (profe != null) {
                    profesorId = profe.getId();
                }
            }

            String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name(), profesorId);

            return ResponseEntity.ok(Map.<String, Object>of(
                    "token", token,
                    "rol", usuario.getRol().name(),
                    "profesorId", profesorId != null ? profesorId : ""
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}