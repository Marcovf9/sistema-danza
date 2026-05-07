package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.ClaseProgramada;
import com.academia.sistema_danza.models.Inscripcion;
import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.Profesor;
import com.academia.sistema_danza.models.Salon;
import com.academia.sistema_danza.repositories.ClaseProgramadaRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.ProfesorRepository;
import com.academia.sistema_danza.repositories.SalonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    @GetMapping("/clases")
    public List<ClaseProgramada> obtenerClasesDisponibles() {
        return claseRepository.findAll();
    }

    @GetMapping("/salones")
    public List<Salon> obtenerSalones() {
        return salonRepository.findAll();
    }

    @GetMapping("/inscripciones/alumno/{alumnoId}")
    public List<Inscripcion> obtenerInscripcionesAlumno(@PathVariable Long alumnoId) {
        return inscripcionRepository.findByAlumnoIdAndActivoTrue(alumnoId);
    }

    @PostMapping("/inscripciones")
    public ResponseEntity<?> inscribirAlumno(
            @RequestParam Long alumnoId, 
            @RequestParam Long claseId,
            @RequestParam(required = false) String diasSeleccionados) {
            
        Alumno alumno = alumnoRepository.findById(alumnoId).orElseThrow();
        ClaseProgramada clase = claseRepository.findById(claseId).orElseThrow();
        
        String diasAInscribir = (diasSeleccionados != null && !diasSeleccionados.isEmpty()) 
                                ? diasSeleccionados 
                                : clase.getDiasSemana();

        Inscripcion nueva = Inscripcion.builder()
                .alumno(alumno)
                .clase(clase)
                .diasSeleccionados(diasAInscribir)
                .fechaInscripcion(LocalDate.now())
                .activo(true)
                .build();
                
        inscripcionRepository.save(nueva);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/clases/{id}")
    public ResponseEntity<?> actualizarClase(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> payload) {
        try {
            ClaseProgramada clase = claseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Clase no encontrada"));
            
            String nuevosDiasStr = payload.containsKey("diasSemana") && payload.get("diasSemana") != null ? 
                    payload.get("diasSemana").toString().toUpperCase() : clase.getDiasSemana();
            
            LocalTime nuevaHora = payload.containsKey("horaInicio") && payload.get("horaInicio") != null ? 
                    LocalTime.parse(payload.get("horaInicio").toString()) : clase.getHoraInicio();
            
            Long nuevoSalonId = clase.getSalon() != null ? clase.getSalon().getId() : null;
            if (payload.containsKey("salonId") && payload.get("salonId") != null && !payload.get("salonId").toString().isEmpty()) {
                nuevoSalonId = Long.valueOf(payload.get("salonId").toString());
            }

            if (nuevoSalonId != null && nuevaHora != null) {
                List<ClaseProgramada> posiblesConflictos = claseRepository.findBySalonIdAndHoraInicio(nuevoSalonId, nuevaHora);
                
                Set<String> diasNuevos = Arrays.stream(nuevosDiasStr.split(","))
                        .map(String::trim)
                        .collect(Collectors.toSet());

                for (ClaseProgramada otraClase : posiblesConflictos) {
                    if (otraClase.getId().equals(id)) continue;

                    Set<String> diasOtra = Arrays.stream(otraClase.getDiasSemana().split(","))
                            .map(String::trim)
                            .collect(Collectors.toSet());
                    
                    if (diasNuevos.stream().anyMatch(diasOtra::contains)) {
                        String diaConflicto = diasNuevos.stream().filter(diasOtra::contains).findFirst().orElse("");
                        return ResponseEntity.badRequest().body("Conflicto: El salón ya está ocupado el día " + 
                                diaConflicto + " a las " + nuevaHora + "hs por (" + otraClase.getDisciplina().getNombre() + ")");
                    }
                }
            }

            clase.setDiasSemana(nuevosDiasStr);
            clase.setHoraInicio(nuevaHora);
            
            if (nuevoSalonId != null) {
                Salon nuevoSalon = salonRepository.findById(nuevoSalonId).orElseThrow();
                clase.setSalon(nuevoSalon);
            }

            if (payload.containsKey("profesorId")) {
                String profIdStr = payload.get("profesorId") != null ? payload.get("profesorId").toString() : "";
                if (!profIdStr.isEmpty()) {
                    Profesor nuevoProfesor = profesorRepository.findById(Long.valueOf(profIdStr))
                            .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
                    clase.setProfesorTitular(nuevoProfesor);
                } else {
                    clase.setProfesorTitular(null);
                }
            }

            ClaseProgramada claseActualizada = claseRepository.save(clase);
            return ResponseEntity.ok(claseActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar la clase: " + e.getMessage());
        }
    }

    @PatchMapping("/inscripciones/{id}/baja")
    public ResponseEntity<?> darDeBajaInscripcion(@PathVariable Long id) {
        return inscripcionRepository.findById(id).map(inscripcion -> {
            inscripcion.setActivo(false); // Baja lógica
            inscripcionRepository.save(inscripcion);
            return ResponseEntity.ok("Inscripción dada de baja correctamente");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
}