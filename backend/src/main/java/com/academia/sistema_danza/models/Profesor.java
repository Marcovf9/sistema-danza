package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profesores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private Long usuarioId; 

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(name = "cbu_alias")
    private String cbuAlias;
}