package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import com.academia.sistema_danza.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal-profesor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfesorPortalController {

    private final UsuarioRepository usuarioRepository;
    private final ClaseProgramadaRepository claseRepository;
    private final InscripcionRepository inscripcionRepository;
    private final SesionClaseRepository sesionClaseRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final AlumnoRepository alumnoRepository;

    @GetMapping("/agenda")
    public ResponseEntity<?> obtenerMiAgenda(Authentication auth) {
        Usuario usuario = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getProfesor() == null) {
            return ResponseEntity.badRequest().body("Tu cuenta no tiene un perfil de profesor asignado.");
        }

        Long miProfesorId = usuario.getProfesor().getId();

        List<Map<String, Object>> miAgenda = claseRepository.findAll().stream()
                .filter(clase -> clase.getProfesorTitular() != null && 
                                 clase.getProfesorTitular().getId().equals(miProfesorId))
                .map(clase -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", clase.getId());
                    dto.put("disciplina", clase.getDisciplina().getNombre());
                    dto.put("salon", clase.getSalon().getNombre());
                    dto.put("horaInicio", clase.getHoraInicio() != null ? clase.getHoraInicio().toString().substring(0, 5) : "S/H");
                    
                    long inscriptos = inscripcionRepository.findAll().stream()
                            .filter(ins -> ins.isActivo() && ins.getClase().getId().equals(clase.getId()))
                            .count();
                    dto.put("cantidadAlumnos", inscriptos);
                    
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(miAgenda);
    }

    @GetMapping("/agenda/{claseId}/asistencia")
    @Transactional
    public ResponseEntity<?> obtenerListaParaAsistencia(@PathVariable Long claseId, Authentication auth) {
        Usuario usuario = usuarioRepository.findByEmail(auth.getName()).orElseThrow();
        Long miProfesorId = usuario.getProfesor().getId();

        ClaseProgramada clase = claseRepository.findById(claseId).orElseThrow();
        
        if (!clase.getProfesorTitular().getId().equals(miProfesorId)) {
            return ResponseEntity.status(403).body("No tienes permiso para tomar lista en esta clase.");
        }

        LocalDate hoy = LocalDate.now();
        
        Optional<SesionClase> sesionOpt = sesionClaseRepository.findAll().stream()
                .filter(s -> s.getClaseProgramada().getId().equals(claseId) && s.getFecha().equals(hoy))
                .findFirst();

        SesionClase sesionHoy;
        if (sesionOpt.isPresent()) {
            sesionHoy = sesionOpt.get();
        } else {
            SesionClase nuevaSesion = SesionClase.builder()
                    .claseProgramada(clase)
                    .fecha(hoy)
                    .profesorDictante(usuario.getProfesor())
                    .build();
            sesionHoy = sesionClaseRepository.save(nuevaSesion);
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

    @PostMapping("/agenda/sesion/{sesionId}/guardar")
    @Transactional
    public ResponseEntity<?> guardarAsistencia(@PathVariable Long sesionId, @RequestBody List<Map<String, String>> datosAsistencia) {
        SesionClase sesion = sesionClaseRepository.findById(sesionId)
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
}