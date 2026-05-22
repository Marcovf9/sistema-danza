package com.academia.sistema_danza.services;

import com.academia.sistema_danza.dto.DetalleReciboDTO;
import com.academia.sistema_danza.dto.ReciboResponseDTO;
import com.academia.sistema_danza.exception.RecursoNoEncontradoException;
import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.*;
import com.academia.sistema_danza.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CajaService {

    private final AlumnoRepository alumnoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final ReciboRepository reciboRepository;

    @Transactional
    public Recibo generarReciboPendienteMensual(Long alumnoId) {
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alumno", alumnoId));

        List<Inscripcion> inscripciones = inscripcionRepository.findByAlumnoIdAndActivoTrue(alumnoId);
        BigDecimal cuotaBase = inscripciones.stream()
                .map(inscripcion -> inscripcion.getClase().getDisciplina().getPrecioBase())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (cuotaBase.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("El alumno no tiene inscripciones activas con costo.");
        }

        Recibo recibo = Recibo.builder()
                .alumno(alumno)
                .fechaEmision(LocalDateTime.now())
                .estado(EstadoRecibo.PENDIENTE)
                .metodoPago(null)
                .detalles(new ArrayList<>())
                .build();

        BigDecimal totalPagar = BigDecimal.ZERO;

        recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.CUOTA_MES, cuotaBase));
        totalPagar = totalPagar.add(cuotaBase);

        if (alumno.getGrupoFamiliar() != null) {
            int cantFamiliares = alumnoRepository.findByGrupoFamiliarId(alumno.getGrupoFamiliar().getId()).size();
            
            if (cantFamiliares == 2) {
                BigDecimal descuento = cuotaBase.multiply(new BigDecimal("0.10"));
                recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.DESCUENTO_FAMILIAR_10, descuento.negate()));
                totalPagar = totalPagar.subtract(descuento);
            } else if (cantFamiliares >= 3) {
                BigDecimal descuento = cuotaBase.multiply(new BigDecimal("0.20"));
                recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.DESCUENTO_FAMILIAR_20, descuento.negate()));
                totalPagar = totalPagar.subtract(descuento);
            }
        }

        recibo.setMontoTotal(totalPagar);
        return reciboRepository.save(recibo);
    }

    @Transactional
    public Recibo cobrarReciboPendiente(Long reciboId, MetodoPago metodoPago) {
        Recibo recibo = reciboRepository.findById(reciboId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Recibo", reciboId));

        if (recibo.getEstado() == EstadoRecibo.PAGADO) {
            throw new IllegalArgumentException("Este recibo ya se encuentra pagado.");
        }

        BigDecimal totalPagar = recibo.getMontoTotal();

        if (LocalDate.now().getDayOfMonth() > 10) {
            BigDecimal recargoMora = totalPagar.multiply(new BigDecimal("0.05"));
            recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.RECARGO_MORA_5, recargoMora));
            totalPagar = totalPagar.add(recargoMora);
        }

        if (metodoPago == MetodoPago.TARJETA_CREDITO) {
            BigDecimal recargoTarjeta = totalPagar.multiply(new BigDecimal("0.10"));
            recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.RECARGO_TARJETA_10, recargoTarjeta));
            totalPagar = totalPagar.add(recargoTarjeta);
        }

        recibo.setMontoTotal(totalPagar);
        recibo.setMetodoPago(metodoPago);
        recibo.setEstado(EstadoRecibo.PAGADO);

        return reciboRepository.save(recibo);
    }

    public ReciboResponseDTO toReciboDTO(Recibo recibo) {
        List<DetalleReciboDTO> detallesDTO = (recibo.getDetalles() != null)
                ? recibo.getDetalles().stream()
                        .map(d -> DetalleReciboDTO.builder()
                                .id(d.getId())
                                .tipoConcepto(d.getTipoConcepto())
                                .monto(d.getMonto())
                                .mesImputacion(d.getMesImputacion())
                                .build())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return ReciboResponseDTO.builder()
                .id(recibo.getId())
                .alumnoId(recibo.getAlumno() != null ? recibo.getAlumno().getId() : null)
                .alumnoNombre(recibo.getAlumno() != null ? recibo.getAlumno().getNombre() : null)
                .alumnoApellido(recibo.getAlumno() != null ? recibo.getAlumno().getApellido() : null)
                .fechaEmision(recibo.getFechaEmision())
                .estado(recibo.getEstado())
                .metodoPago(recibo.getMetodoPago())
                .montoTotal(recibo.getMontoTotal())
                .detalles(detallesDTO)
                .build();
    }

    private DetalleRecibo crearDetalle(Recibo recibo, TipoConcepto concepto, BigDecimal monto) {
        String mesActual = LocalDate.now().getYear() + "-" + String.format("%02d", LocalDate.now().getMonthValue());
        return DetalleRecibo.builder()
                .recibo(recibo)
                .tipoConcepto(concepto)
                .monto(monto)
                .mesImputacion(mesActual)
                .build();
    }
}