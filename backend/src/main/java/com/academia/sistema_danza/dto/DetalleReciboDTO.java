package com.academia.sistema_danza.dto;

import com.academia.sistema_danza.models.enums.TipoConcepto;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleReciboDTO {
    private Long id;
    private TipoConcepto tipoConcepto;
    private BigDecimal monto;
    private String mesImputacion;
}
