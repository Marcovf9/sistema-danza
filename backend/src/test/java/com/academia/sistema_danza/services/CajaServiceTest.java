package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.EstadoRecibo;
import com.academia.sistema_danza.models.enums.MetodoPago;
import com.academia.sistema_danza.models.enums.TipoConcepto;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import com.academia.sistema_danza.repositories.ReciboRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CajaServiceTest {

    private static final Long ALUMNO_ID = 1L;

    @Mock private AlumnoRepository alumnoRepository;
    @Mock private InscripcionRepository inscripcionRepository;
    @Mock private ReciboRepository reciboRepository;

    @InjectMocks private CajaService cajaService;

    private Alumno alumno;

    @BeforeEach
    void setUp() {
        alumno = Alumno.builder().id(ALUMNO_ID).nombre("Lucía").apellido("Pérez").build();
    }

    // ── Generación del recibo mensual ─────────────────────────────────────────

    @Test
    void generaReciboPendienteConLaSumaDeLasDisciplinasActivas() {
        prepararAlumnoInscriptoEn("25000", "22000");
        sinRecibosPrevios();

        Recibo recibo = cajaService.generarReciboPendienteMensual(ALUMNO_ID);

        assertThat(recibo.getEstado()).isEqualTo(EstadoRecibo.PENDIENTE);
        assertThat(recibo.getMetodoPago()).isNull();
        assertThat(recibo.getMontoTotal()).isEqualByComparingTo("47000");
        assertThat(recibo.getDetalles()).singleElement()
                .satisfies(d -> {
                    assertThat(d.getTipoConcepto()).isEqualTo(TipoConcepto.CUOTA_MES);
                    assertThat(d.getMonto()).isEqualByComparingTo("47000");
                });
    }

    @Test
    void aplicaDescuentoDel10PorCientoConDosIntegrantesEnElGrupoFamiliar() {
        prepararAlumnoInscriptoEn("25000");
        prepararGrupoFamiliarDe(2);
        sinRecibosPrevios();

        Recibo recibo = cajaService.generarReciboPendienteMensual(ALUMNO_ID);

        assertThat(recibo.getMontoTotal()).isEqualByComparingTo("22500");
        assertThat(detalle(recibo, TipoConcepto.DESCUENTO_FAMILIAR_10).getMonto()).isEqualByComparingTo("-2500");
    }

    @Test
    void aplicaDescuentoDel20PorCientoConTresOMasIntegrantesEnElGrupoFamiliar() {
        prepararAlumnoInscriptoEn("25000");
        prepararGrupoFamiliarDe(4);
        sinRecibosPrevios();

        Recibo recibo = cajaService.generarReciboPendienteMensual(ALUMNO_ID);

        assertThat(recibo.getMontoTotal()).isEqualByComparingTo("20000");
        assertThat(detalle(recibo, TipoConcepto.DESCUENTO_FAMILIAR_20).getMonto()).isEqualByComparingTo("-5000");
    }

    @Test
    void noAplicaDescuentoSiElAlumnoEsElUnicoDeSuGrupoFamiliar() {
        prepararAlumnoInscriptoEn("25000");
        prepararGrupoFamiliarDe(1);
        sinRecibosPrevios();

        Recibo recibo = cajaService.generarReciboPendienteMensual(ALUMNO_ID);

        assertThat(recibo.getMontoTotal()).isEqualByComparingTo("25000");
        assertThat(recibo.getDetalles()).hasSize(1);
    }

    @Test
    void rechazaGenerarReciboSiElAlumnoNoTieneInscripcionesActivas() {
        when(alumnoRepository.findById(ALUMNO_ID)).thenReturn(Optional.of(alumno));
        when(inscripcionRepository.findByAlumnoIdAndActivoTrue(ALUMNO_ID)).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> cajaService.generarReciboPendienteMensual(ALUMNO_ID))
                .hasMessageContaining("no tiene inscripciones activas");
        verify(reciboRepository, never()).save(any());
    }

    @Test
    void noDuplicaNiModificaUnReciboDelMesQueYaEstaPagado() {
        prepararAlumnoInscriptoEn("25000");
        Recibo pagado = reciboDelMes(EstadoRecibo.PAGADO, "25000");
        when(reciboRepository.findAll()).thenReturn(List.of(pagado));

        Recibo resultado = cajaService.generarReciboPendienteMensual(ALUMNO_ID);

        assertThat(resultado).isSameAs(pagado);
        assertThat(resultado.getMontoTotal()).isEqualByComparingTo("25000");
        verify(reciboRepository, never()).save(any());
    }

    @Test
    void recalculaElReciboPendienteDelMesEnLugarDeCrearOtro() {
        prepararAlumnoInscriptoEn("25000", "22000");
        Recibo pendiente = reciboDelMes(EstadoRecibo.PENDIENTE, "25000");
        pendiente.getDetalles().add(DetalleRecibo.builder()
                .recibo(pendiente).tipoConcepto(TipoConcepto.CUOTA_MES).monto(new BigDecimal("25000")).build());
        when(reciboRepository.findAll()).thenReturn(List.of(pendiente));
        when(reciboRepository.save(any(Recibo.class))).thenAnswer(inv -> inv.getArgument(0));

        Recibo resultado = cajaService.generarReciboPendienteMensual(ALUMNO_ID);

        assertThat(resultado).isSameAs(pendiente);
        assertThat(resultado.getMontoTotal()).isEqualByComparingTo("47000");
        assertThat(resultado.getDetalles()).hasSize(1);
    }

    // ── Cobro ─────────────────────────────────────────────────────────────────

    @Test
    void cobrarEnEfectivoMarcaElReciboComoPagadoSinRecargo() {
        Recibo recibo = reciboDelMes(EstadoRecibo.PENDIENTE, "25000");
        prepararCobro(recibo);

        Recibo cobrado = cajaService.cobrarReciboPendiente(recibo.getId(), MetodoPago.EFECTIVO);

        assertThat(cobrado.getEstado()).isEqualTo(EstadoRecibo.PAGADO);
        assertThat(cobrado.getMetodoPago()).isEqualTo(MetodoPago.EFECTIVO);
        assertThat(cobrado.getMontoTotal()).isEqualByComparingTo("25000");
        assertThat(cobrado.getDetalles()).isEmpty();
    }

    @Test
    void cobrarConTarjetaDeCreditoSumaUnRecargoDel10PorCiento() {
        Recibo recibo = reciboDelMes(EstadoRecibo.PENDIENTE, "22500");
        prepararCobro(recibo);

        Recibo cobrado = cajaService.cobrarReciboPendiente(recibo.getId(), MetodoPago.TARJETA_CREDITO);

        assertThat(cobrado.getMontoTotal()).isEqualByComparingTo("24750");
        assertThat(detalle(cobrado, TipoConcepto.RECARGO_TARJETA_10).getMonto()).isEqualByComparingTo("2250");
    }

    @Test
    void noPermiteCobrarDosVecesElMismoRecibo() {
        Recibo recibo = reciboDelMes(EstadoRecibo.PAGADO, "25000");
        when(reciboRepository.findById(recibo.getId())).thenReturn(Optional.of(recibo));

        assertThatThrownBy(() -> cajaService.cobrarReciboPendiente(recibo.getId(), MetodoPago.EFECTIVO))
                .isInstanceOf(IllegalArgumentException.class);
        verify(reciboRepository, never()).save(any());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void prepararAlumnoInscriptoEn(String... precios) {
        when(alumnoRepository.findById(ALUMNO_ID)).thenReturn(Optional.of(alumno));
        List<Inscripcion> inscripciones = new ArrayList<>();
        for (String precio : precios) {
            Disciplina disciplina = new Disciplina();
            disciplina.setPrecioBase(new BigDecimal(precio));
            ClaseProgramada clase = new ClaseProgramada();
            clase.setDisciplina(disciplina);
            inscripciones.add(Inscripcion.builder().alumno(alumno).clase(clase).activo(true).build());
        }
        when(inscripcionRepository.findByAlumnoIdAndActivoTrue(ALUMNO_ID)).thenReturn(inscripciones);
    }

    private void prepararGrupoFamiliarDe(int integrantes) {
        GrupoFamiliar grupo = new GrupoFamiliar();
        grupo.setId(10L);
        alumno.setGrupoFamiliar(grupo);
        List<Alumno> familia = new ArrayList<>();
        for (int i = 0; i < integrantes; i++) familia.add(new Alumno());
        when(alumnoRepository.findByGrupoFamiliarId(10L)).thenReturn(familia);
    }

    private void sinRecibosPrevios() {
        when(reciboRepository.findAll()).thenReturn(Collections.emptyList());
        when(reciboRepository.save(any(Recibo.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private void prepararCobro(Recibo recibo) {
        when(reciboRepository.findById(recibo.getId())).thenReturn(Optional.of(recibo));
        when(reciboRepository.save(any(Recibo.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private Recibo reciboDelMes(EstadoRecibo estado, String monto) {
        return Recibo.builder()
                .id(99L)
                .alumno(alumno)
                .fechaEmision(LocalDateTime.now())
                .estado(estado)
                .montoTotal(new BigDecimal(monto))
                .detalles(new ArrayList<>())
                .build();
    }

    private static DetalleRecibo detalle(Recibo recibo, TipoConcepto concepto) {
        return recibo.getDetalles().stream()
                .filter(d -> d.getTipoConcepto() == concepto)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Falta el concepto " + concepto));
    }
}
