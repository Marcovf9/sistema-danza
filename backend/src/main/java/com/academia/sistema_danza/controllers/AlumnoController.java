package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlumnoController {

    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Alumno> obtenerTodos() {
        return alumnoRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Alumno guardarAlumno(@RequestBody Alumno alumno) {
        alumno.setActivo(true);
        
        if (alumno.getTutor() != null && alumno.getTutor().getId() != null) {
            Alumno tutorDb = alumnoRepository.findById(alumno.getTutor().getId())
                    .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));
            alumno.setTutor(tutorDb);
        } else {
            if (alumno.getEmail() != null && !alumno.getEmail().isEmpty() && alumno.getDni() != null) {
                Usuario nuevoUsuario = Usuario.builder()
                        .email(alumno.getEmail().trim())
                        .passwordHash(passwordEncoder.encode(alumno.getDni().trim())) 
                        .rol(RolUsuario.ALUMNO)
                        .requiereCambioPassword(true) 
                        .build();
                usuarioRepository.save(nuevoUsuario);
                alumno.setUsuarioId(nuevoUsuario.getId());
            }
        }
        
        return alumnoRepository.save(alumno);
    }

    @PutMapping("/{id}")
    @Transactional
    public Alumno actualizarAlumno(@PathVariable Long id, @RequestBody Alumno datosNuevos) {
        Alumno alumnoExistente = alumnoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));
            
        alumnoExistente.setNombre(datosNuevos.getNombre());
        alumnoExistente.setApellido(datosNuevos.getApellido());
        alumnoExistente.setDni(datosNuevos.getDni());
        alumnoExistente.setTelefono(datosNuevos.getTelefono());
        alumnoExistente.setEmail(datosNuevos.getEmail());
        alumnoExistente.setContactoEmergencia(datosNuevos.getContactoEmergencia());
        alumnoExistente.setGrupoFamiliar(datosNuevos.getGrupoFamiliar());
        alumnoExistente.setLugarNacimiento(datosNuevos.getLugarNacimiento());
        alumnoExistente.setFechaNacimiento(datosNuevos.getFechaNacimiento());
        alumnoExistente.setDireccion(datosNuevos.getDireccion());
        alumnoExistente.setCodigoPostal(datosNuevos.getCodigoPostal());
        alumnoExistente.setLocalidad(datosNuevos.getLocalidad());
        alumnoExistente.setProvincia(datosNuevos.getProvincia());
        alumnoExistente.setFacebook(datosNuevos.getFacebook());
        alumnoExistente.setInstagram(datosNuevos.getInstagram());
        alumnoExistente.setEsMenor(datosNuevos.getEsMenor());
        alumnoExistente.setCoberturaMedica(datosNuevos.getCoberturaMedica());
        alumnoExistente.setNroAfiliado(datosNuevos.getNroAfiliado());
        alumnoExistente.setBarrio(datosNuevos.getBarrio());

        if (datosNuevos.getTutor() != null && datosNuevos.getTutor().getId() != null) {
            Alumno tutorDb = alumnoRepository.findById(datosNuevos.getTutor().getId())
                    .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));
            alumnoExistente.setTutor(tutorDb);
        } else {
            alumnoExistente.setTutor(null);
        }
        
        if (alumnoExistente.getTutor() == null) {
            if (alumnoExistente.getUsuarioId() == null && datosNuevos.getEmail() != null && !datosNuevos.getEmail().isEmpty()) {
                 Usuario nuevoUsuario = Usuario.builder()
                        .email(datosNuevos.getEmail().trim())
                        .passwordHash(passwordEncoder.encode(datosNuevos.getDni().trim()))
                        .rol(RolUsuario.ALUMNO)
                        .requiereCambioPassword(true)
                        .build();
                usuarioRepository.save(nuevoUsuario);
                alumnoExistente.setUsuarioId(nuevoUsuario.getId());
            } else if (alumnoExistente.getUsuarioId() != null && datosNuevos.getEmail() != null) {
                Usuario usuario = usuarioRepository.findById(alumnoExistente.getUsuarioId()).orElseThrow();
                usuario.setEmail(datosNuevos.getEmail().trim());
                usuarioRepository.save(usuario);
            }
        }
        
        return alumnoRepository.save(alumnoExistente);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> darDeBajaAlumno(@PathVariable Long id) {
        return alumnoRepository.findById(id).map(alumno -> {
            
            if (alumno.getMenoresACargo() != null) {
                boolean tieneMenoresActivos = alumno.getMenoresACargo().stream()
                        .anyMatch(Alumno::isActivo);
                
                if (tieneMenoresActivos) {
                    return ResponseEntity.badRequest().body("No se puede dar de baja. Este alumno es el adulto responsable de uno o más menores que aún están activos en el sistema.");
                }
            }

            inscripcionRepository.findByAlumnoIdAndActivoTrue(alumno.getId())
                .forEach(inscripcion -> {
                    inscripcion.setActivo(false);
                    inscripcionRepository.save(inscripcion);
                });

            alumno.setActivo(false);
            alumnoRepository.save(alumno);
            
            return ResponseEntity.ok().build();
            
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reactivar")
    @Transactional
    public ResponseEntity<?> reactivarAlumno(@PathVariable Long id) {
        return alumnoRepository.findById(id).map(alumno -> {
            alumno.setActivo(true);
            alumnoRepository.save(alumno);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}