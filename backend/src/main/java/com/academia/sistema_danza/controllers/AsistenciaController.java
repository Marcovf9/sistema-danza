package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Asistencia;
import com.academia.sistema_danza.models.ClaseProgramada;
import com.academia.sistema_danza.models.Inscripcion;
import com.academia.sistema_danza.models.SesionClase;
import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import com.academia.sistema_danza.repositories.AsistenciaRepository;
import com.academia.sistema_danza.repositories.ClaseProgramadaRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import com.academia.sistema_danza.repositories.SesionClaseRepository;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/asistencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AsistenciaController {

    private final ClaseProgramadaRepository claseRepository;
    private final SesionClaseRepository sesionRepository;
    private final InscripcionRepository inscripcionRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final AlumnoRepository alumnoRepository;

    @GetMapping("/hoy/profesor/{profesorId}")
    public List<ClaseProgramada> obtenerClasesDeHoy(@PathVariable Long profesorId) {
        return claseRepository.findAll().stream()
                .filter(c -> c.getProfesorTitular() != null && c.getProfesorTitular().getId().equals(profesorId))
                .toList();
    }

        @GetMapping("/clase/{claseId}/alumnos")
    public List<Map<String, Object>> obtenerAlumnosParaLista(@PathVariable Long claseId) {
        List<Inscripcion> inscripciones = inscripcionRepository.findAll().stream()
                .filter(i -> i.getClase().getId().equals(claseId) && i.isActivo())
                .toList();

        return inscripciones.stream().map(i -> Map.<String, Object>of(
                "alumnoId", i.getAlumno().getId(),
                "nombre", i.getAlumno().getNombre(),
                "apellido", i.getAlumno().getApellido()
        )).toList();
    }

    @GetMapping("/clase/{claseId}/asistencia")
    @Transactional
    public ResponseEntity<?> obtenerListaParaAsistencia(
            @PathVariable Long claseId,
            @RequestParam(required = false) String fecha) {

        ClaseProgramada clase = claseRepository.findById(claseId).orElseThrow();
        LocalDate fechaAsistencia = (fecha != null && !fecha.isEmpty()) ? LocalDate.parse(fecha) : LocalDate.now();

        Optional<SesionClase> sesionOpt = sesionRepository.findAll().stream()
                .filter(s -> s.getClaseProgramada().getId().equals(claseId) && s.getFecha().equals(fechaAsistencia))
                .findFirst();

        SesionClase sesionHoy;
        if (sesionOpt.isPresent()) {
            sesionHoy = sesionOpt.get();
        } else {
            SesionClase nuevaSesion = SesionClase.builder()
                    .claseProgramada(clase)
                    .fecha(fechaAsistencia)
                    .profesorDictante(clase.getProfesorTitular())
                    .build();
            sesionHoy = sesionRepository.save(nuevaSesion);
        }

        List<Map<String, Object>> listaAlumnos = inscripcionRepository.findAll().stream()
                .filter(ins -> ins.isActivo() && ins.getClase().getId().equals(claseId))
                .map(ins -> {
                    Alumno alumno = ins.getAlumno();
                    Optional<Asistencia> asistenciaPrevia = asistenciaRepository.findAll().stream()
                            .filter(a -> a.getSesionClase().getId().equals(sesionHoy.getId()) && a.getAlumno().getId().equals(alumno.getId()))
                            .findFirst();

                    Map<String, Object> dto = new HashMap<>();
                    dto.put("alumnoId", alumno.getId());
                    dto.put("nombre", alumno.getNombre());
                    dto.put("apellido", alumno.getApellido());
                    dto.put("estado", asistenciaPrevia.map(a -> a.getEstado().name()).orElse(null));
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "sesionId", sesionHoy.getId(),
            "alumnos", listaAlumnos
        ));
    }

    @PostMapping("/sesion/{sesionId}/guardar")
    @Transactional
    public ResponseEntity<?> guardarAsistencia(
            @PathVariable Long sesionId,
            @RequestBody List<Map<String, String>> datosAsistencia) {
        
        SesionClase sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        for (Map<String, String> dato : datosAsistencia) {
            Long alumnoId = Long.parseLong(dato.get("alumnoId"));
            EstadoAsistencia estado = EstadoAsistencia.valueOf(dato.get("estado"));

            Alumno alumno = alumnoRepository.findById(alumnoId).orElseThrow();

            Asistencia asistencia = asistenciaRepository.findAll().stream()
                    .filter(a -> a.getSesionClase().getId().equals(sesionId) && a.getAlumno().getId().equals(alumnoId))
                    .findFirst()
                    .orElse(Asistencia.builder().sesionClase(sesion).alumno(alumno).build());

            asistencia.setEstado(estado);
            asistenciaRepository.save(asistencia);
        }
        return ResponseEntity.ok("Asistencia guardada con éxito");
    }

    @GetMapping("/alumno/{alumnoId}")
    public List<Map<String, Object>> obtenerHistorialAlumno(@PathVariable Long alumnoId) {
        List<Asistencia> historial = asistenciaRepository.findAll().stream()
                .filter(a -> a.getAlumno().getId().equals(alumnoId))
                .toList();
        return historial.stream().map(a -> Map.<String, Object>of(
                "fecha", a.getSesionClase().getFecha(),
                "disciplina", a.getSesionClase().getClaseProgramada().getDisciplina().getNombre(),
                "estado", a.getEstado().name()
        )).toList();
    }
}