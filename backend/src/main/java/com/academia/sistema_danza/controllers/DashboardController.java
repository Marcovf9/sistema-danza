package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.repositories.*;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final AlumnoRepository alumnoRepository;
    private final ReciboRepository reciboRepository;
    private final AsistenciaRepository asistenciaRepository;

    @GetMapping("/resumen")
    public Map<String, Object> obtenerResumen() {
        LocalDate hoy = LocalDate.now();
        int mesActual = hoy.getMonthValue();
        int anioActual = hoy.getYear();

        long alumnosActivos = alumnoRepository.findAll().stream()
                .filter(a -> a.isActivo())
                .count();

        BigDecimal ingresosMes = reciboRepository.findAll().stream()
                .filter(r -> r.getFechaEmision().getMonthValue() == mesActual && r.getFechaEmision().getYear() == anioActual)
                .map(r -> r.getMontoTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> alertas = alumnoRepository.findAll().stream()
                .filter(a -> a.isActivo())
                .map(a -> {
                    long ausencias = asistenciaRepository.findAll().stream()
                            .filter(asist -> asist.getAlumno().getId().equals(a.getId()) && 
                                             asist.getEstado() == EstadoAsistencia.AUSENTE &&
                                             asist.getSesionClase().getFecha().getMonthValue() == mesActual)
                            .count();
                    return Map.<String, Object>of("nombre", a.getNombre() + " " + a.getApellido(), "ausencias", ausencias);
                })
                .filter(m -> (long) m.get("ausencias") >= 2)
                .sorted((m1, m2) -> Long.compare((long) m2.get("ausencias"), (long) m1.get("ausencias")))
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Long> metodos = reciboRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getMetodoPago().name(), Collectors.counting()));

        return Map.of(
            "alumnosActivos", alumnosActivos,
            "ingresosMes", ingresosMes,
            "alertasAsistencia", alertas,
            "metodosPago", metodos
        );
    }
}