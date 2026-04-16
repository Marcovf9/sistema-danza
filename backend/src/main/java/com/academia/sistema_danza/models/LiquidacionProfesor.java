package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import com.academia.sistema_danza.models.enums.*;

@Entity
@Table(name = "liquidaciones_profesores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LiquidacionProfesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_id", nullable = false)
    private Profesor profesor;

    @Column(nullable = false)
    private Integer mes;

    @Column(nullable = false)
    private Integer anio;

    @Column(name = "total_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalBase;

    @Column(name = "total_comisiones", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalComisiones;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoLiquidacion estado = EstadoLiquidacion.PENDIENTE;
}