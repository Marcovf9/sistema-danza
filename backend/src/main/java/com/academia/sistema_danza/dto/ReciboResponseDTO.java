package com.academia.sistema_danza.dto;

import com.academia.sistema_danza.models.enums.EstadoRecibo;
import com.academia.sistema_danza.models.enums.MetodoPago;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReciboResponseDTO {
    private Long id;

    // Alumno aplanado (evita serializar la entidad completa con sus relaciones)
    private Long alumnoId;
    private String alumnoNombre;
    private String alumnoApellido;

    private LocalDateTime fechaEmision;
    private EstadoRecibo estado;
    private MetodoPago metodoPago;
    private BigDecimal montoTotal;
    private List<DetalleReciboDTO> detalles;
}
