package com.academia.sistema_danza.models;

import com.academia.sistema_danza.models.enums.EstadoAsistencia;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asistencias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_clase_id", nullable = false)
    private SesionClase sesionClase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoAsistencia estado;
}