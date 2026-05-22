package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.exception.RecursoNoEncontradoException;
import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.repositories.*;
import com.academia.sistema_danza.services.ConflictoHorarioService;
import com.academia.sistema_danza.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academico")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AcademicoController {

    private final ClaseProgramadaRepository claseRepository;
    private final InscripcionRepository inscripcionRepository;
    private final AlumnoRepository alumnoRepository;
    private final ProfesorRepository profesorRepository;
    private final SalonRepository salonRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final ConflictoHorarioService conflictoHorarioService;
    private final EmailService emailService;

    // ──────────────────────────────────────────────────
    //  CLASES
    // ──────────────────────────────────────────────────

    @GetMapping("/clases")
    public List<ClaseProgramada> obtenerClasesDisponibles() {
        return claseRepository.findAll();
    }

    @PostMapping("/clases")
    @Transactional
    public ResponseEntity<?> crearClase(@RequestBody Map<String, Object> payload) {
        String diasSemana  = getString(payload, "diasSemana", "").toUpperCase();
        LocalTime horaInicio = LocalTime.parse(getString(payload, "horaInicio", "09:00"));
        int duracion = getInt(payload, "duracionMinutos", 60);

        Long disciplinaId = getLong(payload, "disciplinaId");
        Long salonId      = getLong(payload, "salonId");
        Long profesorId   = getLong(payload, "profesorId");

        if (disciplinaId == null) {
            return ResponseEntity.badRequest().body("La disciplina es obligatoria.");
        }

        // ── Detección de conflictos ──
        conflictoHorarioService.verificarConflictoSalon(salonId, diasSemana, horaInicio, duracion, null);
        conflictoHorarioService.verificarConflictoProfesor(profesorId, diasSemana, horaInicio, duracion, null);

        ClaseProgramada.ClaseProgramadaBuilder builder = ClaseProgramada.builder()
                .diasSemana(diasSemana)
                .horaInicio(horaInicio)
                .duracionMinutos(duracion)
                .disciplina(disciplinaRepository.findById(disciplinaId)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Disciplina", disciplinaId)));

        if (salonId != null) {
            builder.salon(salonRepository.findById(salonId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Salón", salonId)));
        }
        if (profesorId != null) {
            builder.profesorTitular(profesorRepository.findById(profesorId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Profesor", profesorId)));
        }

        return ResponseEntity.ok(claseRepository.save(builder.build()));
    }

    @PutMapping("/clases/{id}")
    @Transactional
    public ResponseEntity<?> actualizarClase(@PathVariable Long id,
                                              @RequestBody Map<String, Object> payload) {
        ClaseProgramada clase = claseRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Clase", id));

        String diasSemana = clase.getDiasSemana();
        if (payload.containsKey("diasSemana") && payload.get("diasSemana") != null) {
            diasSemana = payload.get("diasSemana").toString().toUpperCase();
        }

        LocalTime horaInicio = clase.getHoraInicio();
        if (payload.containsKey("horaInicio") && payload.get("horaInicio") != null) {
            horaInicio = LocalTime.parse(payload.get("horaInicio").toString());
        }

        int duracion = clase.getDuracionMinutos() != null ? clase.getDuracionMinutos() : 60;
        if (payload.containsKey("duracionMinutos") && payload.get("duracionMinutos") != null) {
            duracion = Integer.parseInt(payload.get("duracionMinutos").toString());
        }

        Long salonId = clase.getSalon() != null ? clase.getSalon().getId() : null;
        if (payload.containsKey("salonId") && payload.get("salonId") != null
                && !payload.get("salonId").toString().isEmpty()) {
            salonId = Long.valueOf(payload.get("salonId").toString());
        }

        Long profesorId = clase.getProfesorTitular() != null ? clase.getProfesorTitular().getId() : null;
        if (payload.containsKey("profesorId")) {
            String profStr = payload.get("profesorId") != null ? payload.get("profesorId").toString() : "";
            profesorId = profStr.isEmpty() ? null : Long.valueOf(profStr);
        }

        // Variables efectivamente finales para uso en lambdas
        final Long finalSalonId = salonId;
        final Long finalProfesorId = profesorId;

        // ── Detección de conflictos (excluye la propia clase en edición) ──
        conflictoHorarioService.verificarConflictoSalon(finalSalonId, diasSemana, horaInicio, duracion, id);
        conflictoHorarioService.verificarConflictoProfesor(finalProfesorId, diasSemana, horaInicio, duracion, id);

        // Aplicar cambios
        clase.setDiasSemana(diasSemana);
        clase.setHoraInicio(horaInicio);
        clase.setDuracionMinutos(duracion);

        if (finalSalonId != null) {
            clase.setSalon(salonRepository.findById(finalSalonId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Salón", finalSalonId)));
        } else {
            clase.setSalon(null);
        }

        if (finalProfesorId != null) {
            clase.setProfesorTitular(profesorRepository.findById(finalProfesorId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Profesor", finalProfesorId)));
        } else {
            clase.setProfesorTitular(null);
        }

        return ResponseEntity.ok(claseRepository.save(clase));
    }

    // ──────────────────────────────────────────────────
    //  SALONES
    // ──────────────────────────────────────────────────

    @GetMapping("/salones")
    public List<Salon> obtenerSalones() {
        return salonRepository.findAll();
    }

    // ──────────────────────────────────────────────────
    //  INSCRIPCIONES
    // ──────────────────────────────────────────────────

    @GetMapping("/inscripciones/alumno/{alumnoId}")
    @Transactional(readOnly = true)
    public List<Inscripcion> obtenerInscripcionesAlumno(@PathVariable Long alumnoId) {
        return inscripcionRepository.findByAlumnoIdAndActivoTrue(alumnoId);
    }

    @PostMapping("/inscripciones")
    @Transactional
    public ResponseEntity<?> inscribirAlumno(
            @RequestParam Long alumnoId,
            @RequestParam Long claseId,
            @RequestParam(required = false) String diasSeleccionados) {

        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno", alumnoId));
        ClaseProgramada clase = claseRepository.findById(claseId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Clase", claseId));

        String diasAInscribir = (diasSeleccionados != null && !diasSeleccionados.isEmpty())
                ? diasSeleccionados
                : clase.getDiasSemana();

        // ── Detección de conflicto del alumno ──
        int duracion = clase.getDuracionMinutos() != null ? clase.getDuracionMinutos() : 60;
        conflictoHorarioService.verificarConflictoAlumno(
                alumnoId, diasAInscribir, clase.getHoraInicio(), duracion);

        Inscripcion nueva = Inscripcion.builder()
                .alumno(alumno)
                .clase(clase)
                .diasSeleccionados(diasAInscribir)
                .fechaInscripcion(LocalDate.now())
                .activo(true)
                .build();

        inscripcionRepository.save(nueva);

        emailService.notificarInscripcionDirectora(alumno.getNombre() + " " + alumno.getApellido(), clase.getDisciplina().getNombre());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/inscripciones/{id}/baja")
    public ResponseEntity<?> darDeBajaInscripcion(@PathVariable Long id) {
        return inscripcionRepository.findById(id).map(inscripcion -> {
            inscripcion.setActivo(false);
            inscripcionRepository.save(inscripcion);
            return ResponseEntity.ok("Inscripción dada de baja correctamente.");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ──────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────

    private String getString(Map<String, Object> m, String key, String def) {
        return m.containsKey(key) && m.get(key) != null ? m.get(key).toString() : def;
    }

    private Long getLong(Map<String, Object> m, String key) {
        if (!m.containsKey(key) || m.get(key) == null || m.get(key).toString().isEmpty()) return null;
        return Long.valueOf(m.get(key).toString());
    }

    private int getInt(Map<String, Object> m, String key, int def) {
        if (!m.containsKey(key) || m.get(key) == null) return def;
        try { return Integer.parseInt(m.get(key).toString()); } catch (NumberFormatException e) { return def; }
    }
}
