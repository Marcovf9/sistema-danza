package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import com.academia.sistema_danza.models.enums.*;

@Entity
@Table(name = "detalles_recibo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleRecibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recibo_id", nullable = false)
    private Recibo recibo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_concepto", nullable = false)
    private TipoConcepto tipoConcepto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "mes_imputacion", length = 7)
    private String mesImputacion; // Formato YYYY-MM
}