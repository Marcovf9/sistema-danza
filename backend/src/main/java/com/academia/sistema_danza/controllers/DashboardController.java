package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.repositories.*;
import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
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
    private final InscripcionRepository inscripcionRepository;

    @GetMapping("/datos")
    public ResponseEntity<Map<String, Object>> obtenerDatosDashboard(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer anio,
            @RequestParam(defaultValue = "false") boolean esHistorico) {
        
        Map<String, Object> data = new HashMap<>();
        LocalDate hoy = LocalDate.now();
        int mesTarget = (mes != null) ? mes : hoy.getMonthValue();
        int anioTarget = (anio != null) ? anio : hoy.getYear();
        
        YearMonth targetYM = YearMonth.of(anioTarget, mesTarget);
        LocalDate finDeMes = targetYM.atEndOfMonth();
        
        long totalAlumnosPeriodo = inscripcionRepository.findAll().stream()
                .filter(ins -> esHistorico || !ins.getFechaInscripcion().isAfter(finDeMes))
                .map(ins -> ins.getAlumno().getId())
                .distinct()
                .count();
        data.put("alumnosActivos", totalAlumnosPeriodo);

        double ingresosPeriodo = reciboRepository.findAll().stream()
                .filter(r -> esHistorico || YearMonth.from(r.getFechaEmision()).equals(targetYM))
                .mapToDouble(r -> r.getMontoTotal().doubleValue())
                .sum();
        data.put("ingresos", ingresosPeriodo);

        double ingresosAnterior = reciboRepository.findAll().stream()
                .filter(r -> !esHistorico && YearMonth.from(r.getFechaEmision()).equals(targetYM.minusMonths(1)))
                .mapToDouble(r -> r.getMontoTotal().doubleValue())
                .sum();
        double crecimiento = (ingresosAnterior > 0) ? ((ingresosPeriodo - ingresosAnterior) / ingresosAnterior) * 100.0 : 0;
        data.put("crecimientoIngresos", Math.round(crecimiento * 10.0) / 10.0);

        Map<String, Long> metodos = reciboRepository.findAll().stream()
                .filter(r -> esHistorico || YearMonth.from(r.getFechaEmision()).equals(targetYM))
                .collect(Collectors.groupingBy(r -> r.getMetodoPago().name(), Collectors.counting()));
        
        List<Map<String, Object>> metodosList = new ArrayList<>();
        metodos.forEach((k, v) -> metodosList.add(Map.of("name", k, "value", v)));
        data.put("metodosPago", metodosList);

        Map<String, Long> distribucion = new HashMap<>();
        inscripcionRepository.findAll().stream()
                .filter(ins -> {
                    if (esHistorico) return true;
                    return !ins.getFechaInscripcion().isAfter(finDeMes);
                })
                .forEach(ins -> {
                    String disciplina = ins.getClase().getDisciplina().getNombre();
                    distribucion.put(disciplina, distribucion.getOrDefault(disciplina, 0L) + 1);
                });

        List<Map<String, Object>> disciplinasList = new ArrayList<>();
        distribucion.forEach((k, v) -> disciplinasList.add(Map.of("name", k, "value", v)));
        data.put("alumnosPorDisciplina", disciplinasList);

        List<Map<String, Object>> alertas = alumnoRepository.findAll().stream()
                .filter(Alumno::isActivo)
                .map(a -> {
                    long ausencias = asistenciaRepository.findAll().stream()
                            .filter(asist -> asist.getAlumno().getId().equals(a.getId()) && 
                                             asist.getEstado() == EstadoAsistencia.AUSENTE &&
                                             asist.getSesionClase().getFecha().getMonthValue() == mesTarget &&
                                             asist.getSesionClase().getFecha().getYear() == anioTarget)
                            .count();
                    return Map.<String, Object>of("nombre", a.getNombre() + " " + a.getApellido(), "ausencias", ausencias);
                })
                .filter(m -> (long) m.get("ausencias") >= 2)
                .collect(Collectors.toList());
        data.put("alertasAsistencia", alertas);

        return ResponseEntity.ok(data);
    }
}