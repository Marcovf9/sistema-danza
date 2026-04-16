package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "sesiones_clases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SesionClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clase_programada_id", nullable = false)
    private ClaseProgramada claseProgramada;

    @Column(nullable = false)
    private LocalDate fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_dictante_id", nullable = false)
    private Profesor profesorDictante;
}