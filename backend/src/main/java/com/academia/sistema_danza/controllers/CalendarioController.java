package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.ClaseProgramada;
import com.academia.sistema_danza.models.Inscripcion;
import com.academia.sistema_danza.repositories.ClaseProgramadaRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/calendario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CalendarioController {

    private final ClaseProgramadaRepository claseRepository;
    private final InscripcionRepository inscripcionRepository;

    @GetMapping("/clases")
    public List<ClaseProgramada> obtenerClases() {
        return claseRepository.findAll();
    }

    @GetMapping("/clase/{id}/detalles")
    public ResponseEntity<?> obtenerDetallesClase(
            @PathVariable Long id,
            @RequestHeader("rol") String rol,
            @RequestHeader(value = "profesorId", required = false) String profesorIdStr) {

        ClaseProgramada clase = claseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));

        boolean esDirector = "DIRECTOR".equals(rol);
        boolean esSuClase = false;

        if (profesorIdStr != null && !profesorIdStr.isEmpty()) {
            Long pId = Long.parseLong(profesorIdStr);
            esSuClase = clase.getProfesorTitular().getId().equals(pId);
        }

        if (!esDirector && !esSuClase) {
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permiso para ver los alumnos de esta clase"));
        }

        List<Inscripcion> inscripciones = inscripcionRepository.findAll().stream()
                .filter(i -> i.getClase().getId().equals(id) && i.isActivo())
                .collect(Collectors.toList());

        List<Map<String, String>> alumnos = inscripciones.stream()
                .map(i -> Map.of(
                        "nombre", i.getAlumno().getNombre() + " " + i.getAlumno().getApellido(),
                        "telefono", i.getAlumno().getTelefono() != null ? i.getAlumno().getTelefono() : "S/D"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "clase", clase,
                "alumnos", alumnos
        ));
    }
}