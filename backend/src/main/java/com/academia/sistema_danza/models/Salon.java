package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "salones")
public class Salon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    // Esto es clave para que el sistema avise si se llenó el cupo
    @Column(name = "capacidad_maxima", nullable = false)
    private Integer capacidadMaxima; 
}