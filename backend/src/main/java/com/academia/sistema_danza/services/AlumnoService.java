package com.academia.sistema_danza.services;

import com.academia.sistema_danza.dto.*;
import com.academia.sistema_danza.exception.RecursoNoEncontradoException;
import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GrupoFamiliarRepository grupoFamiliarRepository;
    private final InscripcionRepository inscripcionRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional(readOnly = true)
    public List<AlumnoResponseDTO> findAll() {
        return alumnoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlumnoResponseDTO crearAlumno(AlumnoRequestDTO dto) {
        if (dto.getDni() != null && !dto.getDni().isBlank()) {
            alumnoRepository.findByDni(dto.getDni().trim()).ifPresent(existente -> {
                String estado = existente.isActivo() ? "activo" : "inactivo";
                throw new IllegalArgumentException("Ya existe un alumno " + estado + " con el DNI " + dto.getDni().trim() + ".");
            });
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            usuarioRepository.findByEmail(dto.getEmail().trim()).ifPresent(u ->
                    { throw new IllegalArgumentException("Ya existe una cuenta con el email " + dto.getEmail().trim() + "."); });
        }

        Alumno alumno = new Alumno();
        mapearDatos(dto, alumno);
        alumno.setActivo(true);

        if (dto.getTutorId() != null) {
            Alumno tutor = alumnoRepository.findById(dto.getTutorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tutor", dto.getTutorId()));
            alumno.setTutor(tutor);
        } else {
            crearCuentaUsuarioSiCorresponde(dto, alumno);
        }

        return toResponseDTO(alumnoRepository.save(alumno));
    }

    @Transactional
    public AlumnoResponseDTO actualizarAlumno(Long id, AlumnoRequestDTO dto) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno", id));

        mapearDatos(dto, alumno);

        if (dto.getTutorId() != null) {
            Alumno tutor = alumnoRepository.findById(dto.getTutorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tutor", dto.getTutorId()));
            alumno.setTutor(tutor);
        } else {
            alumno.setTutor(null);
            actualizarOCrearCuenta(dto, alumno);
        }

        return toResponseDTO(alumnoRepository.save(alumno));
    }

    @Transactional
    public void bajaLogica(Long id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno", id));
        alumno.setActivo(false);
        alumnoRepository.save(alumno);
    }

    @Transactional
    public void reactivar(Long id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno", id));
        alumno.setActivo(true);
        alumnoRepository.save(alumno);
    }

    @Transactional
    public void eliminar(Long id) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno", id));
        asistenciaRepository.deleteByAlumnoId(id);
        inscripcionRepository.deleteByAlumnoId(id);
        if (alumno.getUsuarioId() != null) {
            usuarioRepository.deleteById(alumno.getUsuarioId());
        }
        alumnoRepository.deleteById(id);
    }

    public AlumnoResponseDTO toResponseDTO(Alumno a) {
        AlumnoResponseDTO.AlumnoResponseDTOBuilder builder = AlumnoResponseDTO.builder()
                .id(a.getId())
                .nombre(a.getNombre())
                .apellido(a.getApellido())
                .dni(a.getDni())
                .telefono(a.getTelefono())
                .email(a.getEmail())
                .contactoEmergencia(a.getContactoEmergencia())
                .fechaNacimiento(a.getFechaNacimiento())
                .lugarNacimiento(a.getLugarNacimiento())
                .direccion(a.getDireccion())
                .codigoPostal(a.getCodigoPostal())
                .barrio(a.getBarrio())
                .localidad(a.getLocalidad())
                .provincia(a.getProvincia())
                .facebook(a.getFacebook())
                .instagram(a.getInstagram())
                .esMenor(a.getEsMenor())
                .coberturaMedica(a.getCoberturaMedica())
                .nroAfiliado(a.getNroAfiliado())
                .fechaVencimientoMatricula(a.getFechaVencimientoMatricula())
                .activo(a.isActivo())
                .usuarioId(a.getUsuarioId());

        if (a.getTutor() != null) {
            builder.tutorId(a.getTutor().getId())
                    .tutorNombre(a.getTutor().getNombre())
                    .tutorApellido(a.getTutor().getApellido());
        }

        if (a.getGrupoFamiliar() != null) {
            builder.grupoFamiliarId(a.getGrupoFamiliar().getId())
                    .grupoFamiliarNombre(a.getGrupoFamiliar().getNombreReferencia());
        }

        List<AlumnoResumenDTO> menores = (a.getMenoresACargo() != null)
                ? a.getMenoresACargo().stream()
                        .map(m -> AlumnoResumenDTO.builder()
                                .id(m.getId())
                                .nombre(m.getNombre())
                                .apellido(m.getApellido())
                                .esMenor(m.getEsMenor())
                                .build())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        builder.menoresACargo(menores);

        return builder.build();
    }

    private void mapearDatos(AlumnoRequestDTO dto, Alumno alumno) {
        alumno.setNombre(dto.getNombre());
        alumno.setApellido(dto.getApellido());
        alumno.setDni(dto.getDni());
        alumno.setTelefono(dto.getTelefono());
        alumno.setEmail(dto.getEmail());
        alumno.setContactoEmergencia(dto.getContactoEmergencia());
        alumno.setFechaNacimiento(dto.getFechaNacimiento());
        alumno.setLugarNacimiento(dto.getLugarNacimiento());
        alumno.setDireccion(dto.getDireccion());
        alumno.setCodigoPostal(dto.getCodigoPostal());
        alumno.setBarrio(dto.getBarrio());
        alumno.setLocalidad(dto.getLocalidad());
        alumno.setProvincia(dto.getProvincia());
        alumno.setFacebook(dto.getFacebook());
        alumno.setInstagram(dto.getInstagram());
        alumno.setEsMenor(dto.getEsMenor() != null ? dto.getEsMenor() : false);
        alumno.setCoberturaMedica(dto.getCoberturaMedica());
        alumno.setNroAfiliado(dto.getNroAfiliado());
        alumno.setFechaVencimientoMatricula(dto.getFechaVencimientoMatricula());

        if (dto.getGrupoFamiliarId() != null) {
            GrupoFamiliar gf = grupoFamiliarRepository.findById(dto.getGrupoFamiliarId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("GrupoFamiliar", dto.getGrupoFamiliarId()));
            alumno.setGrupoFamiliar(gf);
        } else {
            alumno.setGrupoFamiliar(null);
        }
    }

    /**
     * La cuenta se crea con una contraseña aleatoria que nadie conoce y el alumno
     * recibe por email un enlace para elegir la suya. No se usa el DNI como clave
     * inicial: es un dato que conocen muchas personas (figura en fichas, recibos y
     * planillas) y alcanzaría con él para entrar a la cuenta antes que su titular.
     */
    private void crearCuentaUsuarioSiCorresponde(AlumnoRequestDTO dto, Alumno alumno) {
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            Usuario usuario = Usuario.builder()
                    .email(dto.getEmail().trim())
                    .passwordHash(passwordEncoder.encode(passwordAleatoria()))
                    .rol(RolUsuario.ALUMNO)
                    .requiereCambioPassword(true)
                    .build();
            usuarioRepository.save(usuario);
            alumno.setUsuarioId(usuario.getId());
            passwordResetService.enviarActivacionCuenta(usuario);
        }
    }

    private static String passwordAleatoria() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void actualizarOCrearCuenta(AlumnoRequestDTO dto, Alumno alumno) {
        if (alumno.getUsuarioId() == null) {
            crearCuentaUsuarioSiCorresponde(dto, alumno);
        } else if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            usuarioRepository.findById(alumno.getUsuarioId()).ifPresent(u -> {
                u.setEmail(dto.getEmail().trim());
                usuarioRepository.save(u);
            });
        }
    }
}
