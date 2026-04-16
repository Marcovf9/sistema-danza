package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.*;
import com.academia.sistema_danza.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfesorService {

    private final AsistenciaRepository asistenciaRepository;
    private final SesionClaseRepository sesionClaseRepository;

    public BigDecimal calcularLiquidacionMensual(Long profesorId, int mes, int anio) {
        List<SesionClase> sesiones = sesionClaseRepository.findByProfesorDictanteIdAndMesAnio(profesorId, mes, anio);
        
        BigDecimal totalSueldo = BigDecimal.ZERO;
        BigDecimal pagoBasePorClase = new BigDecimal("5000");

        for (SesionClase sesion : sesiones) {
            totalSueldo = totalSueldo.add(pagoBasePorClase);

            long presentes = asistenciaRepository.countBySesionClaseIdAndEstado(sesion.getId(), EstadoAsistencia.PRESENTE);

            if (presentes > 6) {
                long excedente = presentes - 6;
                BigDecimal precioCuota = sesion.getClaseProgramada().getDisciplina().getPrecioBase();
                BigDecimal plusAlumnos = precioCuota.multiply(new BigDecimal("0.40")).multiply(new BigDecimal(excedente));
                
                totalSueldo = totalSueldo.add(plusAlumnos);
            }
        }
        return totalSueldo;
    }
}