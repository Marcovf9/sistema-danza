package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.Recibo;
import com.academia.sistema_danza.models.enums.EstadoRecibo;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import com.academia.sistema_danza.repositories.ReciboRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacturacionAutomaticaService {

    private final AlumnoRepository alumnoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final CajaService cajaService;
    private final ReciboRepository reciboRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 3 1 * ?")
    @Transactional
    public void generarCuotasMensualesAutomaticas() {
        log.info("🤖 [ROBOT DE CAJA] Iniciando facturación del mes: " + LocalDate.now().getMonth());
        List<Alumno> alumnosActivos = alumnoRepository.findByActivoTrue();
        int recibosGenerados = 0;

        for (Alumno alumno : alumnosActivos) {
            boolean tieneClasesActivas = inscripcionRepository.findAll().stream()
                    .anyMatch(ins -> ins.isActivo() && ins.getAlumno().getId().equals(alumno.getId()));

            if (tieneClasesActivas) {
                try {
                    cajaService.generarReciboPendienteMensual(alumno.getId());
                    recibosGenerados++;
                } catch (Exception e) {
                    log.error("❌ Error al facturar al alumno ID " + alumno.getId(), e);
                }
            }
        }
        log.info("🤖 [ROBOT DE CAJA] Finalizado. Se generaron " + recibosGenerados + " recibos nuevos.");
    }

    @Scheduled(cron = "0 0 9 11 * ?")
    public void notificarDeudoresAutomaticamente() {
        log.info("🤖 [ROBOT DE CORREOS] Iniciando notificación de mora...");
        
        int mesActual = LocalDate.now().getMonthValue();
        int anioActual = LocalDate.now().getYear();
        
        List<Recibo> pendientes = reciboRepository.findAll().stream()
                .filter(r -> r.getEstado() == EstadoRecibo.PENDIENTE &&
                             r.getFechaEmision().getMonthValue() == mesActual &&
                             r.getFechaEmision().getYear() == anioActual)
                .toList();

        int correosEnviados = 0;
        for (Recibo recibo : pendientes) {
            Alumno alumno = recibo.getAlumno();
            if (alumno.getEmail() != null && !alumno.getEmail().isEmpty()) {
                emailService.enviarCorreoRecordatorio(
                        alumno.getEmail(),
                        alumno.getNombre() + " " + alumno.getApellido(),
                        recibo.getMontoTotal().toString(),
                        recibo.getId()
                );
                correosEnviados++;
            }
        }
        log.info("🤖 [ROBOT DE CORREOS] Finalizado. Correos enviados: " + correosEnviados);
    }
}