package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "disciplinas")
public class Disciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre; // Ej: Ballet, Jazz, Reggaetón
}