// CajaService.java
package com.academia.sistema_danza.services;

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
import java.util.List;

@Service
@RequiredArgsConstructor
public class CajaService {

    private final AlumnoRepository alumnoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final ReciboRepository reciboRepository;

    @Transactional
    public Recibo generarReciboCuotaMensual(Long alumnoId, MetodoPago metodoPago) {
        // 1. Buscar al alumno
        Alumno alumno = alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        // 2. Obtener sus clases activas para sumar el valor de la cuota base
        List<Inscripcion> inscripciones = inscripcionRepository.findByAlumnoIdAndActivoTrue(alumnoId);
        BigDecimal cuotaBase = inscripciones.stream()
                .map(inscripcion -> inscripcion.getClase().getDisciplina().getPrecioBase())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (cuotaBase.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("El alumno no tiene inscripciones activas con costo.");
        }

        // 3. Empezamos a armar la cabecera del Recibo
        Recibo recibo = Recibo.builder()
                .alumno(alumno)
                .fechaEmision(LocalDateTime.now())
                .metodoPago(metodoPago)
                .detalles(new ArrayList<>())
                .build();

        BigDecimal totalPagar = BigDecimal.ZERO;

        // A. Agregar la Cuota Base al detalle
        recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.CUOTA_MES, cuotaBase));
        totalPagar = totalPagar.add(cuotaBase);

        // B. Regla de Negocio: Descuento Familiar (Si el alumno pertenece a uno)
        if (alumno.getGrupoFamiliar() != null) {
            int cantFamiliares = alumnoRepository.findByGrupoFamiliarId(alumno.getGrupoFamiliar().getId()).size();
            
            if (cantFamiliares == 2) {
                BigDecimal descuento = cuotaBase.multiply(new BigDecimal("0.10")); // 10%
                recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.DESCUENTO_FAMILIAR_10, descuento.negate()));
                totalPagar = totalPagar.subtract(descuento);
            } else if (cantFamiliares >= 3) {
                BigDecimal descuento = cuotaBase.multiply(new BigDecimal("0.20")); // 20%
                recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.DESCUENTO_FAMILIAR_20, descuento.negate()));
                totalPagar = totalPagar.subtract(descuento);
            }
        }

        // C. Regla de Negocio: Recargo por Mora (Si el pago es después del día 10)
        if (LocalDate.now().getDayOfMonth() > 10) {
            BigDecimal recargoMora = cuotaBase.multiply(new BigDecimal("0.05")); // 5%
            recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.RECARGO_MORA_5, recargoMora));
            totalPagar = totalPagar.add(recargoMora);
        }

        // D. Regla de Negocio: Recargo por Tarjeta de Crédito (Sobre el total acumulado)
        if (metodoPago == MetodoPago.TARJETA_CREDITO) {
            BigDecimal recargoTarjeta = totalPagar.multiply(new BigDecimal("0.10")); // 10%
            recibo.getDetalles().add(crearDetalle(recibo, TipoConcepto.RECARGO_TARJETA_10, recargoTarjeta));
            totalPagar = totalPagar.add(recargoTarjeta);
        }

        // E. Guardar en Base de Datos (CascadeType.ALL se encarga de guardar los detalles)
        recibo.setMontoTotal(totalPagar);
        return reciboRepository.save(recibo); 
    }

    // Método auxiliar para mantener el código limpio al generar las líneas del recibo
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