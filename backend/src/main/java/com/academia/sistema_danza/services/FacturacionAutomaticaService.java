package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.enums.MetodoPago;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
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

    @Scheduled(cron = "0 0 3 1 * ?")
    @Transactional
    public void generarCuotasMensualesAutomaticas() {
        log.info("🤖 [ROBOT DE CAJA] Iniciando facturación del mes: " + LocalDate.now().getMonth());

        List<Alumno> alumnosActivos = alumnoRepository.findByActivoTrue();
        int recibosGenerados = 0;

        for (Alumno alumno : alumnosActivos) {
            // Verificamos si el alumno tiene alguna inscripción activa
            boolean tieneClasesActivas = inscripcionRepository.findAll().stream()
                    .anyMatch(ins -> ins.isActivo() && ins.getAlumno().getId().equals(alumno.getId()));

            if (tieneClasesActivas) {
                try {
                    cajaService.generarReciboPendienteMensual(alumno.getId());
                    recibosGenerados++;
                    log.info("✅ Cuota generada para alumno ID: " + alumno.getId());
                } catch (Exception e) {
                    log.error("❌ Error al facturar al alumno ID " + alumno.getId(), e);
                }
            }
        }

        log.info("🤖 [ROBOT DE CAJA] Finalizado. Se generaron " + recibosGenerados + " recibos nuevos.");
    }
}