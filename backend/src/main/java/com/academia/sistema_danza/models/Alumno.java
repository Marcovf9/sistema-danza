package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "alumnos")
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación 1 a 1: Cada alumno tiene un usuario para poder loguearse
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(length = 20)
    private String telefono;

    @Column(name = "contacto_emergencia", length = 150)
    private String contactoEmergencia;

    // Nos servirá para aplicar el descuento del 10% y 20% a hermanos/familia
    @Column(name = "grupo_familiar_id")
    private Integer grupoFamiliarId;

    @Column(name = "fecha_ultimo_pago_matricula")
    private LocalDate fechaUltimoPagoMatricula;
}