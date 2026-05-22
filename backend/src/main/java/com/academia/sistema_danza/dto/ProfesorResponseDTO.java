package com.academia.sistema_danza.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfesorResponseDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String cbuAlias;
    private Boolean activo;
    private Long usuarioId;
}
