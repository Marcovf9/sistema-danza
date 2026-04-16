package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "disciplinas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Disciplina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;

    @Column(name = "precio_base", precision = 10, scale = 2)
    private BigDecimal precioBase; 
}