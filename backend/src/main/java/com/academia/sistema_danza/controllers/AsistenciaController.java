package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Asistencia;
import com.academia.sistema_danza.models.ClaseProgramada;
import com.academia.sistema_danza.models.Inscripcion;
import com.academia.sistema_danza.models.SesionClase;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import com.academia.sistema_danza.repositories.AsistenciaRepository;
import com.academia.sistema_danza.repositories.ClaseProgramadaRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import com.academia.sistema_danza.repositories.SesionClaseRepository;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
                .filter(c -> c.getProfesorTitular().getId().equals(profesorId))
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

    @PostMapping("/guardar")
    public ResponseEntity<?> guardarAsistencia(
            @RequestParam Long claseId,
            @RequestParam Long profesorId,
            @RequestBody List<Map<String, Object>> listaAsistencia) {

        ClaseProgramada clase = claseRepository.findById(claseId).orElseThrow();
        SesionClase sesion = SesionClase.builder()
                .claseProgramada(clase)
                .fecha(LocalDate.now())
                .profesorDictante(clase.getProfesorTitular())
                .build();
        
        sesion = sesionRepository.save(sesion);

        List<Asistencia> asistencias = new ArrayList<>();
        for (Map<String, Object> registro : listaAsistencia) {
            Long alumnoId = ((Number) registro.get("alumnoId")).longValue();
            String estadoStr = (String) registro.get("estado");
            
            Asistencia a = Asistencia.builder()
                    .sesionClase(sesion)
                    .alumno(alumnoRepository.findById(alumnoId).orElseThrow())
                    .estado(EstadoAsistencia.valueOf(estadoStr))
                    .build();
            asistencias.add(a);
        }
        
        asistenciaRepository.saveAll(asistencias);
        return ResponseEntity.ok().build();
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