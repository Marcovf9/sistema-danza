package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Salon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "aforo_maximo", nullable = false)
    private Integer aforoMaximo;
}