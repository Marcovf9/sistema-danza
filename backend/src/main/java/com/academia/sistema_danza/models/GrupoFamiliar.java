package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "grupos_familiares")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GrupoFamiliar {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_referencia", nullable = false)
    private String nombreReferencia;

    @OneToMany(mappedBy = "grupoFamiliar")
    private List<Alumno> alumnos;
}