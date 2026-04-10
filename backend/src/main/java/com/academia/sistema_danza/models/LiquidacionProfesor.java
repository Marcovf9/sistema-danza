package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "liquidacion_profesores")
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

    @Column(name = "clases_dadas")
    private Integer clasesDadas = 0;

    @Column(name = "alumnos_extra")
    private Integer alumnosExtra = 0;

    @Column(name = "descuentos_por_reemplazo", precision = 10, scale = 2)
    private BigDecimal descuentosPorReemplazo = BigDecimal.ZERO;

    @Column(name = "total_a_pagar", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAPagar;

    @Column(nullable = false)
    private Boolean pagado = false;

    @Column(name = "fecha_liquidacion")
    private LocalDate fechaLiquidacion;
}