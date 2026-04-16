package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "clases_programadas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClaseProgramada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_titular_id", nullable = false)
    private Profesor profesorTitular;

    @Column(name = "dias_semana", nullable = false, length = 100)
    private String diasSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id", nullable = false)
    private Disciplina disciplina;
}