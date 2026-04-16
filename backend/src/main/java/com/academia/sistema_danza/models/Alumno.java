package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "alumnos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(unique = true, length = 20)
    private String dni;
    
    @Column(length = 50)
    private String telefono;

    @Column(name = "contacto_emergencia", length = 150)
    private String contactoEmergencia;

    @Column(name = "fecha_vencimiento_matricula")
    private LocalDate fechaVencimientoMatricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_familiar_id")
    private GrupoFamiliar grupoFamiliar;

    @OneToMany(mappedBy = "alumno")
    private List<Inscripcion> inscripciones;

    @Column(nullable = false)
    private boolean activo = true;
}