package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    @Column(name = "fecha_generacion")
    private LocalDateTime fechaGeneracion;

    public BigDecimal getTotalAPagar() {
        BigDecimal base = this.totalBase != null ? this.totalBase : BigDecimal.ZERO;
        BigDecimal comisiones = this.totalComisiones != null ? this.totalComisiones : BigDecimal.ZERO;
        return base.add(comisiones);
    }
}