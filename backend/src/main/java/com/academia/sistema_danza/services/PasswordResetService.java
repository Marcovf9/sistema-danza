package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.PasswordResetToken;
import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.repositories.PasswordResetTokenRepository;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    static final int HORAS_VALIDEZ_ACTIVACION = 72;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Solicita un reset de contraseña. Por seguridad, siempre devuelve
     * el mismo mensaje sin revelar si el email existe o no.
     */
    @Transactional
    public void solicitarReset(String email) {
        usuarioRepository.findByEmail(email.trim()).ifPresent(usuario -> {
            String linkReset = crearLinkConToken(usuario, LocalDateTime.now().plusHours(1));
            emailService.enviarEmailResetPassword(usuario.getEmail(), linkReset);
        });
    }

    /**
     * Envía el email de bienvenida a una cuenta recién creada, con un enlace para
     * que el titular elija su contraseña. Nadie más la conoce en ningún momento.
     */
    @Transactional
    public void enviarActivacionCuenta(Usuario usuario) {
        String linkActivacion = crearLinkConToken(usuario, LocalDateTime.now().plusHours(HORAS_VALIDEZ_ACTIVACION));
        emailService.enviarEmailActivacionCuenta(usuario.getEmail(), linkActivacion, HORAS_VALIDEZ_ACTIVACION);
    }

    private String crearLinkConToken(Usuario usuario, LocalDateTime expiry) {
        // Eliminar tokens anteriores del mismo usuario
        tokenRepository.deleteByUsuarioId(usuario.getId());

        String tokenUUID = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .usuario(usuario)
                .token(tokenUUID)
                .expiry(expiry)
                .build();
        tokenRepository.save(resetToken);

        return frontendUrl + "/reset-password?token=" + tokenUUID;
    }

    /**
     * Valida el token y actualiza la contraseña del usuario.
     */
    @Transactional
    public void resetearPassword(String token, String nuevaPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("El enlace de recuperación no es válido o ya fue utilizado."));

        if (resetToken.getUsado()) {
            throw new IllegalArgumentException("Este enlace ya fue utilizado. Solicitá uno nuevo.");
        }

        if (resetToken.isExpirado()) {
            tokenRepository.delete(resetToken);
            throw new IllegalArgumentException("El enlace de recuperación ha expirado. Solicitá uno nuevo.");
        }

        var usuario = resetToken.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        usuario.setRequiereCambioPassword(false);
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        tokenRepository.save(resetToken);

        log.info("✅ Contraseña restablecida para: {}", usuario.getEmail());
    }
}
