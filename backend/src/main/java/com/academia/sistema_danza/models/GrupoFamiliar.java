package com.academia.sistema_danza.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "grupos_familiares")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GrupoFamiliar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_referencia", nullable = false, length = 100)
    private String nombreReferencia;

    @JsonIgnore
    @OneToMany(mappedBy = "grupoFamiliar")
    @Builder.Default
    private List<Alumno> alumnos = new ArrayList<>();
}