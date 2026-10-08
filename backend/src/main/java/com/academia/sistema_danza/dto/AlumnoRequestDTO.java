package com.academia.sistema_danza.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlumnoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    private String dni;
    private String telefono;

    @Email(message = "El email no tiene un formato válido")
    private String email;

    private String contactoEmergencia;
    private LocalDate fechaNacimiento;
    private String lugarNacimiento;
    private String direccion;
    private String codigoPostal;
    private String barrio;
    private String localidad;
    private String provincia;
    private String facebook;
    private String instagram;
    private Boolean esMenor;
    private String coberturaMedica;
    private String nroAfiliado;
    private LocalDate fechaVencimientoMatricula;

    private Long tutorId;
    private Long grupoFamiliarId;
}
