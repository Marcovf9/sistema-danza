package com.academia.sistema_danza.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "imagenes_productos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ImagenProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnoreProperties("imagenes")
    private Producto producto;

    @Column(name = "datos_imagen", columnDefinition = "TEXT", nullable = false)
    private String datosImagen;
}