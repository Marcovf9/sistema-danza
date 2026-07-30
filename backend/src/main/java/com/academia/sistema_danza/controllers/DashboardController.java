package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.repositories.*;
import com.academia.sistema_danza.services.ExcelService;
import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
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
    private final LiquidacionProfesorRepository liquidacionRepository;
    private final EgresoRepository egresoRepository;
    
    @Autowired
    private ExcelService excelService;
    @Autowired
    private AuditoriaLogRepository auditoriaLogRepository;

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
        
        List<Alumno> todosLosAlumnos = alumnoRepository.findAll();
        List<Recibo> todosLosRecibos = reciboRepository.findAll();
        List<Inscripcion> todasLasInscripciones = inscripcionRepository.findAll();
        List<LiquidacionProfesor> liquidaciones = liquidacionRepository.findAll();
        List<Egreso> todosLosEgresos = egresoRepository.findAll();

        long totalActivos = todosLosAlumnos.stream().filter(Alumno::isActivo).count();
        data.put("alumnosActivos", totalActivos);

        double ingresosPeriodo = todosLosRecibos.stream()
                .filter(r -> r.getEstado() != null && r.getEstado().name().equals("PAGADO"))
                .filter(r -> r.getFechaEmision() != null && (esHistorico || YearMonth.from(r.getFechaEmision()).equals(targetYM)))
                .mapToDouble(r -> r.getMontoTotal() != null ? r.getMontoTotal().doubleValue() : 0.0)
                .sum();
        data.put("ingresos", ingresosPeriodo);

        double sueldosProfesores = liquidaciones.stream()
                .filter(l -> l.getEstado() != null && l.getEstado().name().equals("PAGADO"))
                .filter(l -> esHistorico || (l.getMes() == mesTarget && l.getAnio() == anioTarget))
                .mapToDouble(l -> l.getTotalAPagar() != null ? l.getTotalAPagar().doubleValue() : 0.0)
                .sum();

        double gastosGenerales = todosLosEgresos.stream()
                .filter(e -> e.getFecha() != null && (esHistorico || YearMonth.from(e.getFecha().toLocalDate()).equals(targetYM)))
                .mapToDouble(e -> e.getMonto() != null ? e.getMonto().doubleValue() : 0.0)
                .sum();

        double totalEgresos = sueldosProfesores + gastosGenerales;
        
        data.put("totalEgresos", totalEgresos);
        data.put("balanceNeto", ingresosPeriodo - totalEgresos);

        Map<String, Long> metodos = todosLosRecibos.stream()
                .filter(r -> r.getMetodoPago() != null && !r.getMetodoPago().name().equalsIgnoreCase("NO_ESPECIFICADO"))
                .filter(r -> r.getFechaEmision() != null && (esHistorico || YearMonth.from(r.getFechaEmision()).equals(targetYM)))
                .collect(Collectors.groupingBy(r -> r.getMetodoPago().name(), Collectors.counting()));
        
        List<Map<String, Object>> metodosList = new ArrayList<>();
        metodos.forEach((k, v) -> metodosList.add(Map.of("name", k, "value", v)));
        data.put("metodosPago", metodosList);

        Map<String, Long> barrios = todosLosAlumnos.stream()
            .filter(Alumno::isActivo)
            .collect(Collectors.groupingBy(a -> (a.getBarrio() != null && !a.getBarrio().trim().isEmpty()) ? a.getBarrio().toUpperCase().trim() : "SIN ESPECIFICAR", Collectors.counting()));
        
        data.put("localidades", barrios.entrySet().stream()
            .map(e -> Map.of("name", e.getKey(), "value", e.getValue()))
            .sorted((a, b) -> Long.compare((long) b.get("value"), (long) a.get("value")))
            .collect(Collectors.toList()));

        long ninos = 0, teens = 0, jovenes = 0, adultos = 0, sinFecha = 0;
        for (Alumno a : todosLosAlumnos) {
            if (a.isActivo()) {
                if (a.getFechaNacimiento() != null) {
                    int edad = Period.between(a.getFechaNacimiento(), LocalDate.now()).getYears();
                    if (edad <= 12) ninos++;
                    else if (edad <= 18) teens++;
                    else if (edad <= 30) jovenes++;
                    else adultos++;
                } else {
                    sinFecha++;
                }
            }
        }
        List<Map<String, Object>> edades = new ArrayList<>();
        if (ninos > 0) edades.add(Map.of("name", "Niños (0-12)", "value", ninos));
        if (teens > 0) edades.add(Map.of("name", "Teens (13-18)", "value", teens));
        if (jovenes > 0) edades.add(Map.of("name", "Jóvenes (19-30)", "value", jovenes));
        if (adultos > 0) edades.add(Map.of("name", "Adultos (31+)", "value", adultos));
        if (sinFecha > 0) edades.add(Map.of("name", "Sin Fecha", "value", sinFecha));
        data.put("edades", edades);

        Map<String, Long> profes = todasLasInscripciones.stream()
            .filter(Inscripcion::isActivo)
            .filter(i -> i.getClase() != null && i.getClase().getProfesorTitular() != null)
            .collect(Collectors.groupingBy(i -> i.getClase().getProfesorTitular().getNombre() + " " + i.getClase().getProfesorTitular().getApellido(), Collectors.counting()));
        
        data.put("profesores", profes.entrySet().stream()
            .map(e -> Map.of("name", e.getKey(), "value", e.getValue()))
            .collect(Collectors.toList()));

        Map<String, Long> distribucion = new HashMap<>();
        todasLasInscripciones.stream()
                .filter(Inscripcion::isActivo)
                .filter(ins -> {
                    if (ins.getFechaInscripcion() == null) return true;
                    if (esHistorico) return true;
                    return !ins.getFechaInscripcion().isAfter(finDeMes);
                })
                .forEach(ins -> {
                    if(ins.getClase() != null && ins.getClase().getDisciplina() != null) {
                        String disciplina = ins.getClase().getDisciplina().getNombre();
                        distribucion.put(disciplina, distribucion.getOrDefault(disciplina, 0L) + 1);
                    }
                });
        List<Map<String, Object>> disciplinasList = new ArrayList<>();
        distribucion.forEach((k, v) -> disciplinasList.add(Map.of("name", k, "value", v)));
        data.put("alumnosPorDisciplina", disciplinasList);

        long temprano = 0, medio = 0, tarde = 0;
        for (Recibo r : todosLosRecibos) {
            if (r.getEstado() != null && r.getEstado().name().equals("PAGADO") && r.getFechaEmision() != null) {
                int dia = r.getFechaEmision().getDayOfMonth();
                if (dia <= 10) temprano++; else if (dia <= 20) medio++; else tarde++;
            }
        }
        data.put("habitosPago", List.of(
            Map.of("name", "Del 1 al 10", "value", temprano), Map.of("name", "Del 11 al 20", "value", medio), Map.of("name", "Fin de mes", "value", tarde)
        ));

        long activas = todasLasInscripciones.stream().filter(Inscripcion::isActivo).count();
        long bajas = todasLasInscripciones.stream().filter(i -> !i.isActivo()).count();
        data.put("retencion", Map.of("activas", activas, "bajas", bajas));

        List<Map<String, Object>> alertas = todosLosAlumnos.stream()
                .filter(Alumno::isActivo)
                .map(a -> {
                    long ausencias = asistenciaRepository.findAll().stream()
                            .filter(asist -> asist.getSesionClase() != null && asist.getSesionClase().getFecha() != null)
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

    @GetMapping("/exportar-excel")
    public ResponseEntity<byte[]> exportarExcelMensual(@RequestParam int mes, @RequestParam int anio) {
        try {
            byte[] excelContent = excelService.generarReporteMensual(mes, anio);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "Reporte_Contable_" + mes + "_" + anio + ".xlsx");
            return ResponseEntity.ok().headers(headers).body(excelContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/auditoria")
    public ResponseEntity<?> obtenerLogs() {
        return ResponseEntity.ok(auditoriaLogRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "fecha")));
    }
}