package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import com.academia.sistema_danza.models.enums.EstadoLiquidacion;
import com.academia.sistema_danza.repositories.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Liquidación mensual de profesores: 5000 fijos por clase dictada y, a partir del
 * séptimo alumno presente, un plus del 40% de la cuota de la disciplina por alumno.
 */
@ExtendWith(MockitoExtension.class)
class ProfesorServiceTest {

    private static final Long PROFESOR_ID = 7L;
    private static final int MES = 3;
    private static final int ANIO = 2026;

    @Mock private ProfesorRepository profesorRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ClaseProgramadaRepository claseProgramadaRepository;
    @Mock private LiquidacionProfesorRepository liquidacionRepository;
    @Mock private EgresoRepository egresoRepository;
    @Mock private AsistenciaRepository asistenciaRepository;
    @Mock private SesionClaseRepository sesionClaseRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private ProfesorService profesorService;

    private final List<SesionClase> sesiones = new ArrayList<>();

    @Test
    void sinClasesDictadasLaLiquidacionEsCero() {
        when(sesionClaseRepository.findByProfesorDictanteIdAndMesAnio(PROFESOR_ID, MES, ANIO))
                .thenReturn(Collections.emptyList());

        assertThat(profesorService.calcularLiquidacionMensual(PROFESOR_ID, MES, ANIO)).isEqualByComparingTo("0");
    }

    @Test
    void pagaElBasicoPorClaseCuandoHaySeisPresentesOMenos() {
        sesion(1L, "25000", 3);
        sesion(2L, "25000", 6);
        prepararSesiones();

        assertThat(profesorService.calcularLiquidacionMensual(PROFESOR_ID, MES, ANIO)).isEqualByComparingTo("10000");
    }

    @Test
    void sumaUnPlusDel40PorCientoDeLaCuotaPorCadaAlumnoPorEncimaDeSeis() {
        // 5000 + 40% de 25000 × (9 − 6) = 5000 + 30000
        sesion(1L, "25000", 9);
        prepararSesiones();

        assertThat(profesorService.calcularLiquidacionMensual(PROFESOR_ID, MES, ANIO)).isEqualByComparingTo("35000");
    }

    @Test
    void cadaSesionUsaLaCuotaDeSuPropiaDisciplina() {
        // Clásica: 5000 + 0.4 × 25000 × 1 = 15000
        // Urbanos: 5000 + 0.4 × 22000 × 2 = 22600
        sesion(1L, "25000", 7);
        sesion(2L, "22000", 8);
        sesion(3L, "22000", 2);
        prepararSesiones();

        assertThat(profesorService.calcularLiquidacionMensual(PROFESOR_ID, MES, ANIO)).isEqualByComparingTo("42600");
    }

    @Test
    void pagarLiquidacionLaRegistraComoPagadaYGeneraElEgresoDeCaja() {
        Profesor profesor = Profesor.builder().id(PROFESOR_ID).nombre("Sofía").apellido("Ruiz").build();
        when(profesorRepository.findById(PROFESOR_ID)).thenReturn(Optional.of(profesor));

        profesorService.pagarLiquidacion(PROFESOR_ID, MES, ANIO, new BigDecimal("42600"));

        ArgumentCaptor<LiquidacionProfesor> liquidacion = ArgumentCaptor.forClass(LiquidacionProfesor.class);
        verify(liquidacionRepository).save(liquidacion.capture());
        assertThat(liquidacion.getValue().getEstado()).isEqualTo(EstadoLiquidacion.PAGADO);
        assertThat(liquidacion.getValue().getMes()).isEqualTo(MES);
        assertThat(liquidacion.getValue().getAnio()).isEqualTo(ANIO);
        assertThat(liquidacion.getValue().getTotalAPagar()).isEqualByComparingTo("42600");

        ArgumentCaptor<Egreso> egreso = ArgumentCaptor.forClass(Egreso.class);
        verify(egresoRepository).save(egreso.capture());
        assertThat(egreso.getValue().getMonto()).isEqualByComparingTo("42600");
        assertThat(egreso.getValue().getConcepto()).contains("Sofía Ruiz");
        assertThat(egreso.getValue().getObservaciones()).contains(MES + " / " + ANIO);
    }

    private void sesion(Long id, String precioCuota, long presentes) {
        Disciplina disciplina = new Disciplina();
        disciplina.setPrecioBase(new BigDecimal(precioCuota));
        ClaseProgramada clase = new ClaseProgramada();
        clase.setDisciplina(disciplina);
        sesiones.add(SesionClase.builder().id(id).claseProgramada(clase).fecha(LocalDate.of(ANIO, MES, 1)).build());
        when(asistenciaRepository.countBySesionClaseIdAndEstado(id, EstadoAsistencia.PRESENTE)).thenReturn(presentes);
    }

    private void prepararSesiones() {
        when(sesionClaseRepository.findByProfesorDictanteIdAndMesAnio(PROFESOR_ID, MES, ANIO)).thenReturn(sesiones);
    }
}
