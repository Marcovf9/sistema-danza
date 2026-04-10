package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "clases_programadas")
public class ClaseProgramada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relaciones con las otras tablas
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id")
    private Disciplina disciplina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_id")
    private Profesor profesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id")
    private Salon salon;

    @Column(name = "dia_semana", nullable = false, length = 15)
    private String diaSemana; // Ej: 'LUNES', 'MARTES'

    // Usamos LocalTime para manejar horas (ej: 18:00)
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    // El precio base de esta clase específica
    @Column(name = "valor_cuota_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorCuotaBase; 
}