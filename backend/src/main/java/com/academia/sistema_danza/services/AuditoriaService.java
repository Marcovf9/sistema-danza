package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.AuditoriaLog;
import com.academia.sistema_danza.repositories.AuditoriaLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaLogRepository auditoriaLogRepository;

    public void registrarAccion(String accion, String entidadAfectada, Long entidadId, String detalles) {
        String usuarioEmail = "Sistema";
        
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            usuarioEmail = auth.getName(); 
        }

        AuditoriaLog log = AuditoriaLog.builder()
                .fecha(LocalDateTime.now())
                .usuarioEmail(usuarioEmail)
                .accion(accion)
                .entidadAfectada(entidadAfectada)
                .entidadId(entidadId)
                .detalles(detalles)
                .build();

        auditoriaLogRepository.save(log);
    }
}