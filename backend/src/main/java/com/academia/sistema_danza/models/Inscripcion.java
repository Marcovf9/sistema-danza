package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "inscripciones", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"alumno_id", "clase_programada_id"})
})
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clase_programada_id", nullable = false)
    private ClaseProgramada claseProgramada;

    @Column(name = "fecha_alta", nullable = false)
    private LocalDate fechaAlta;
}