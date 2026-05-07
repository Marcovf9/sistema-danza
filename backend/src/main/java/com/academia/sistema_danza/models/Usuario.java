package com.academia.sistema_danza.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.academia.sistema_danza.models.enums.RolUsuario;

@Entity
@Table(name = "usuarios")
@Getter 
@Setter 
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY)
    private Profesor profesor;

    @Builder.Default
    @Column(name = "requiere_cambio_password", nullable = false)
    private Boolean requiereCambioPassword = false;
}