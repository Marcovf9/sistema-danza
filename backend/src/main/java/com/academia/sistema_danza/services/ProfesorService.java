package com.academia.sistema_danza.services;

import com.academia.sistema_danza.dto.ProfesorRequestDTO;
import com.academia.sistema_danza.dto.ProfesorResponseDTO;
import com.academia.sistema_danza.exception.RecursoNoEncontradoException;
import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.*;
import com.academia.sistema_danza.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfesorService {

    private final ProfesorRepository profesorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClaseProgramadaRepository claseProgramadaRepository;
    private final LiquidacionProfesorRepository liquidacionRepository;
    private final EgresoRepository egresoRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final SesionClaseRepository sesionClaseRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<ProfesorResponseDTO> findAll() {
        return profesorRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfesorResponseDTO crearProfesor(ProfesorRequestDTO dto) {
        Usuario nuevoUsuario = crearUsuarioProfesor(dto);

        Profesor nuevoProfesor = Profesor.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .cbuAlias(dto.getCbuAlias())
                .usuarioId(nuevoUsuario.getId())
                .build();
        profesorRepository.save(nuevoProfesor);

        return toResponseDTO(nuevoProfesor, dto.getEmail());
    }

    @Transactional
    public ProfesorResponseDTO actualizarProfesor(Long id, ProfesorRequestDTO dto) {
        Profesor profe = profesorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesor", id));
        profe.setNombre(dto.getNombre());
        profe.setApellido(dto.getApellido());
        profe.setCbuAlias(dto.getCbuAlias());
        profesorRepository.save(profe);

        // La baja borra el usuario de acceso: editar a un profesor sin usuario lo reactiva
        if (profe.getUsuarioId() == null) {
            Usuario nuevoUsuario = crearUsuarioProfesor(dto);
            profe.setUsuarioId(nuevoUsuario.getId());
            profe.setActivo(true);
            profesorRepository.save(profe);
            return toResponseDTO(profe, nuevoUsuario.getEmail());
        }

        Usuario usuario = usuarioRepository.findById(profe.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario del profesor", profe.getUsuarioId()));
        String email = dto.getEmail().trim();
        if (!email.equalsIgnoreCase(usuario.getEmail())) {
            validarEmailDisponible(email);
        }
        usuario.setEmail(email);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
            // La eligió la directora: el profesor debe cambiarla al entrar
            usuario.setRequiereCambioPassword(true);
        }
        usuarioRepository.save(usuario);

        return toResponseDTO(profe, dto.getEmail());
    }

    private Usuario crearUsuarioProfesor(ProfesorRequestDTO dto) {
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Hay que asignarle una contraseña para darle acceso al sistema.");
        }
        String email = dto.getEmail().trim();
        validarEmailDisponible(email);
        return usuarioRepository.save(Usuario.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .rol(RolUsuario.PROFESOR)
                .requiereCambioPassword(true)
                .build());
    }

    private void validarEmailDisponible(String email) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Ya existe una cuenta con el email " + email + ".");
        }
    }

    @Transactional
    public void bajaLogica(Long id) {
        Profesor profe = profesorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesor", id));

        profe.setActivo(false);
        profesorRepository.save(profe);

        List<ClaseProgramada> clasesDelProfe = claseProgramadaRepository.findByProfesorTitularId(id);
        for (ClaseProgramada clase : clasesDelProfe) {
            clase.setProfesorTitular(null);
            claseProgramadaRepository.save(clase);
        }

        if (profe.getUsuarioId() != null) {
            usuarioRepository.deleteById(profe.getUsuarioId());
            profe.setUsuarioId(null);
            profesorRepository.save(profe);
        }
    }

    @Transactional
    public void pagarLiquidacion(Long profesorId, int mes, int anio, BigDecimal monto) {
        Profesor profesor = profesorRepository.findById(profesorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Profesor", profesorId));

        LiquidacionProfesor liq = LiquidacionProfesor.builder()
                .profesor(profesor)
                .mes(mes)
                .anio(anio)
                .totalBase(monto)
                .totalComisiones(BigDecimal.ZERO)
                .estado(EstadoLiquidacion.PAGADO)
                .build();
        liquidacionRepository.save(liq);

        Egreso gastoSueldo = Egreso.builder()
                .concepto("Sueldo Prof: " + profesor.getNombre() + " " + profesor.getApellido())
                .monto(monto)
                .fecha(LocalDateTime.now())
                .observaciones("Liquidación Mes " + mes + " / " + anio)
                .build();
        egresoRepository.save(gastoSueldo);
    }

    public BigDecimal calcularLiquidacionMensual(Long profesorId, int mes, int anio) {
        List<SesionClase> sesiones = sesionClaseRepository.findByProfesorDictanteIdAndMesAnio(profesorId, mes, anio);

        BigDecimal totalSueldo = BigDecimal.ZERO;
        BigDecimal pagoBasePorClase = new BigDecimal("5000");

        for (SesionClase sesion : sesiones) {
            totalSueldo = totalSueldo.add(pagoBasePorClase);

            long presentes = asistenciaRepository.countBySesionClaseIdAndEstado(sesion.getId(), EstadoAsistencia.PRESENTE);

            if (presentes > 6) {
                long excedente = presentes - 6;
                BigDecimal precioCuota = sesion.getClaseProgramada().getDisciplina().getPrecioBase();
                BigDecimal plusAlumnos = precioCuota.multiply(new BigDecimal("0.40")).multiply(new BigDecimal(excedente));
                totalSueldo = totalSueldo.add(plusAlumnos);
            }
        }
        return totalSueldo;
    }

    public ProfesorResponseDTO toResponseDTO(Profesor p) {
        String email = null;
        if (p.getUsuarioId() != null) {
            email = usuarioRepository.findById(p.getUsuarioId())
                    .map(Usuario::getEmail)
                    .orElse(null);
        }
        return toResponseDTO(p, email);
    }

    private ProfesorResponseDTO toResponseDTO(Profesor p, String email) {
        return ProfesorResponseDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .apellido(p.getApellido())
                .email(email)
                .cbuAlias(p.getCbuAlias())
                .activo(p.getActivo())
                .usuarioId(p.getUsuarioId())
                .build();
    }
}
