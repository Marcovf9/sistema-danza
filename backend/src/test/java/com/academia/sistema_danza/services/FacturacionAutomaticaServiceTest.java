package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.Recibo;
import com.academia.sistema_danza.models.enums.EstadoRecibo;
import com.academia.sistema_danza.models.enums.TipoConcepto;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import com.academia.sistema_danza.repositories.ReciboRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacturacionAutomaticaServiceTest {

    @Mock private AlumnoRepository alumnoRepository;
    @Mock private InscripcionRepository inscripcionRepository;
    @Mock private CajaService cajaService;
    @Mock private ReciboRepository reciboRepository;
    @Mock private EmailService emailService;

    @InjectMocks private FacturacionAutomaticaService facturacion;

    @Test
    void aplicaRecargoPorMoraDel5PorCientoSoloALosRecibosPendientesDelMes() {
        Alumno alumno = Alumno.builder().id(1L).nombre("Lucía").email("lucia@example.com").build();
        Recibo pendiente = recibo(1L, alumno, EstadoRecibo.PENDIENTE, "20000", LocalDateTime.now());
        Recibo pagado = recibo(2L, alumno, EstadoRecibo.PAGADO, "20000", LocalDateTime.now());
        Recibo pendienteMesAnterior = recibo(3L, alumno, EstadoRecibo.PENDIENTE, "20000", LocalDateTime.now().minusMonths(1));
        when(reciboRepository.findAll()).thenReturn(List.of(pendiente, pagado, pendienteMesAnterior));

        facturacion.notificarDeudoresAutomaticamente();

        assertThat(pendiente.getMontoTotal()).isEqualByComparingTo("21000");
        assertThat(pendiente.getDetalles()).singleElement()
                .satisfies(d -> {
                    assertThat(d.getTipoConcepto()).isEqualTo(TipoConcepto.RECARGO_MORA_5);
                    assertThat(d.getMonto()).isEqualByComparingTo("1000");
                });
        assertThat(pagado.getMontoTotal()).isEqualByComparingTo("20000");
        assertThat(pendienteMesAnterior.getMontoTotal()).isEqualByComparingTo("20000");
        verify(reciboRepository).save(pendiente);
        verify(reciboRepository, never()).save(pagado);
        verify(emailService).enviarCorreoRecordatorio(eq("lucia@example.com"), eq("Lucía"), eq("21000.00"), eq(1L));
    }

    @Test
    void siElAlumnoEsMenorElAvisoDeDeudaLeLlegaAlTutor() {
        Alumno tutor = Alumno.builder().id(2L).nombre("Marta").email("marta@example.com").build();
        Alumno menor = Alumno.builder().id(3L).nombre("Juana").esMenor(true).tutor(tutor).build();
        Recibo pendiente = recibo(5L, menor, EstadoRecibo.PENDIENTE, "10000", LocalDateTime.now());
        when(reciboRepository.findAll()).thenReturn(List.of(pendiente));

        facturacion.notificarDeudoresAutomaticamente();

        verify(emailService).enviarCorreoRecordatorio(eq("marta@example.com"), eq("Marta"), anyString(), eq(5L));
    }

    private static Recibo recibo(Long id, Alumno alumno, EstadoRecibo estado, String monto, LocalDateTime emision) {
        return Recibo.builder()
                .id(id)
                .alumno(alumno)
                .estado(estado)
                .montoTotal(new BigDecimal(monto))
                .fechaEmision(emision)
                .detalles(new ArrayList<>())
                .build();
    }
}
