package com.academia.sistema_danza.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "inscripciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inscripcion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id", nullable = false)
    @JsonIgnoreProperties("inscripciones") 
    private Alumno alumno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clase_programada_id", nullable = false)
    @JsonIgnoreProperties("inscripciones") 
    private ClaseProgramada clase;

    @Column(name = "fecha_inscripcion", nullable = false, updatable = false)
    private LocalDate fechaInscripcion;

    @Column(nullable = false)
    private boolean activo;

    @PrePersist
    protected void onCreate() {
        if (this.fechaInscripcion == null) {
            this.fechaInscripcion = LocalDate.now();
        }
        this.activo = true;
    }
}