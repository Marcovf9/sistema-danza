package com.academia.sistema_danza.services;

import com.academia.sistema_danza.dto.*;
import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GrupoFamiliarRepository grupoFamiliarRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AlumnoResponseDTO> findAll() {
        return alumnoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlumnoResponseDTO crearAlumno(AlumnoRequestDTO dto) {
        Alumno alumno = new Alumno();
        mapearDatos(dto, alumno);
        alumno.setActivo(true);

        if (dto.getTutorId() != null) {
            Alumno tutor = alumnoRepository.findById(dto.getTutorId())
                    .orElseThrow(() -> new RuntimeException("Tutor no encontrado con id: " + dto.getTutorId()));
            alumno.setTutor(tutor);
        } else {
            crearCuentaUsuarioSiCorresponde(dto, alumno);
        }

        return toResponseDTO(alumnoRepository.save(alumno));
    }

    @Transactional
    public AlumnoResponseDTO actualizarAlumno(Long id, AlumnoRequestDTO dto) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado con id: " + id));

        mapearDatos(dto, alumno);

        if (dto.getTutorId() != null) {
            Alumno tutor = alumnoRepository.findById(dto.getTutorId())
                    .orElseThrow(() -> new RuntimeException("Tutor no encontrado con id: " + dto.getTutorId()));
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
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado con id: " + id));
        alumno.setActivo(false);
        alumnoRepository.save(alumno);
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
                    .orElseThrow(() -> new RuntimeException("Grupo familiar no encontrado con id: " + dto.getGrupoFamiliarId()));
            alumno.setGrupoFamiliar(gf);
        } else {
            alumno.setGrupoFamiliar(null);
        }
    }

    private void crearCuentaUsuarioSiCorresponde(AlumnoRequestDTO dto, Alumno alumno) {
        if (dto.getEmail() != null && !dto.getEmail().isBlank() && dto.getDni() != null) {
            Usuario usuario = Usuario.builder()
                    .email(dto.getEmail().trim())
                    .passwordHash(passwordEncoder.encode(dto.getDni().trim()))
                    .rol(RolUsuario.ALUMNO)
                    .requiereCambioPassword(true)
                    .build();
            usuarioRepository.save(usuario);
            alumno.setUsuarioId(usuario.getId());
        }
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
