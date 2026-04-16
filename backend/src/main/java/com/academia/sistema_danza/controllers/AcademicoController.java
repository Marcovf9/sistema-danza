package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.ClaseProgramada;
import com.academia.sistema_danza.models.Inscripcion;
import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.repositories.ClaseProgramadaRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/academico")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AcademicoController {

    private final ClaseProgramadaRepository claseRepository;
    private final InscripcionRepository inscripcionRepository;
    private final AlumnoRepository alumnoRepository;

    // 1. Obtener todas las clases disponibles para mostrar en el selector
    @GetMapping("/clases")
    public List<ClaseProgramada> obtenerClasesDisponibles() {
        return claseRepository.findAll();
    }

    // 2. Obtener las inscripciones activas de un alumno específico
    @GetMapping("/inscripciones/alumno/{alumnoId}")
    public List<Inscripcion> obtenerInscripcionesAlumno(@PathVariable Long alumnoId) {
        return inscripcionRepository.findByAlumnoIdAndActivoTrue(alumnoId);
    }

    // 3. Inscribir a un alumno en una clase
    @PostMapping("/inscripciones")
    public ResponseEntity<?> inscribirAlumno(@RequestParam Long alumnoId, @RequestParam Long claseId) {
        Alumno alumno = alumnoRepository.findById(alumnoId).orElseThrow();
        ClaseProgramada clase = claseRepository.findById(claseId).orElseThrow();

        Inscripcion nueva = Inscripcion.builder()
                .alumno(alumno)
                .clase(clase)
                .fechaInscripcion(LocalDate.now())
                .activo(true)
                .build();

        inscripcionRepository.save(nueva);
        return ResponseEntity.ok().build();
    }
}