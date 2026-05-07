package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "alumnos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @JsonIgnore
    @OneToMany(mappedBy = "alumno")
    private List<Inscripcion> inscripciones;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(length = 150)
    private String email;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    private Usuario usuario;
    
    @Column(name = "lugar_nacimiento", length = 100)
    private String lugarNacimiento;
    
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    
    @Column(length = 200)
    private String direccion;
    
    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;
    
    @Column(length = 100)
    private String localidad;
    
    @Column(length = 100)
    private String provincia;
    
    @Column(length = 100)
    private String facebook;
    
    @Column(length = 100)
    private String instagram;
    
    @Column(name = "es_menor", nullable = false)
    @Builder.Default
    private Boolean esMenor = false;

    @Column(name = "cobertura_medica", length = 100)
    private String coberturaMedica;
    
    @Column(name = "nro_afiliado", length = 100)
    private String nroAfiliado;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id")
    @JsonIgnoreProperties({"menoresACargo", "tutor", "inscripciones", "hibernateLazyInitializer", "handler"})
    private Alumno tutor;

    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"tutor", "inscripciones", "hibernateLazyInitializer", "handler"})
    private List<Alumno> menoresACargo;
}