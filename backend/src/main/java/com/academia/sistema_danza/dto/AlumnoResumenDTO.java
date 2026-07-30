package com.academia.sistema_danza.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlumnoResumenDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private Boolean esMenor;
}
