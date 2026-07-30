package com.academia.sistema_danza.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlumnoResponseDTO {

    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
    private String email;
    private String contactoEmergencia;
    private LocalDate fechaNacimiento;
    private String lugarNacimiento;
    private String direccion;
    private String codigoPostal;
    private String localidad;
    private String provincia;
    private String facebook;
    private String instagram;
    private Boolean esMenor;
    private String coberturaMedica;
    private String nroAfiliado;
    private LocalDate fechaVencimientoMatricula;
    private boolean activo;
    private Long usuarioId;

    // Tutor aplanado (sin recursión)
    private Long tutorId;
    private String tutorNombre;
    private String tutorApellido;

    // Grupo familiar aplanado
    private Long grupoFamiliarId;
    private String grupoFamiliarNombre;

    // Menores a cargo (solo datos básicos)
    private List<AlumnoResumenDTO> menoresACargo;
}
