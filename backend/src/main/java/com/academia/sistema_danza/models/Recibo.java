package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.academia.sistema_danza.models.enums.*;

@Entity
@Table(name = "recibos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id") // Permite nulos para ventas extra
    private Alumno alumno;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleRecibo> detalles;
}