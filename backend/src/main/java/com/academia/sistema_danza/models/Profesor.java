package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "profesores")
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(length = 20)
    private String telefono;

    @Column(name = "cbu_alias", length = 100)
    private String cbuAlias;

    // BigDecimal es obligatorio en Java para manejar dinero sin errores de redondeo
    @Column(name = "tarifa_plana_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifaPlanaBase; 
}