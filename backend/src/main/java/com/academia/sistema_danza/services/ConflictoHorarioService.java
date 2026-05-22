package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.ClaseProgramada;
import com.academia.sistema_danza.models.Inscripcion;
import com.academia.sistema_danza.repositories.ClaseProgramadaRepository;
import com.academia.sistema_danza.repositories.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio centralizado para detectar conflictos de horario antes de
 * persistir cambios en clases o inscripciones.
 *
 * Algoritmo de solapamiento:
 *   Dos rangos [A_inicio, A_fin) y [B_inicio, B_fin) se solapan si:
 *   A_inicio < B_fin  AND  B_inicio < A_fin
 */
@Service
@RequiredArgsConstructor
public class ConflictoHorarioService {

    private final ClaseProgramadaRepository claseRepository;
    private final InscripcionRepository inscripcionRepository;

    /**
     * Verifica que el salón no esté ocupado en el rango horario indicado.
     *
     * @param salonId          ID del salón a chequear
     * @param diasSemana       días de la nueva clase (ej. "LUNES,MIERCOLES")
     * @param horaInicio       hora de inicio de la nueva clase
     * @param duracionMinutos  duración en minutos de la nueva clase
     * @param claseIdExcluir   ID de la clase a ignorar (null si es nueva)
     */
    public void verificarConflictoSalon(Long salonId, String diasSemana,
                                         LocalTime horaInicio, int duracionMinutos,
                                         Long claseIdExcluir) {
        if (salonId == null) return;

        List<ClaseProgramada> clasesEnSalon = claseRepository.findBySalonId(salonId);
        Set<String> diasNuevos = parsearDias(diasSemana);

        for (ClaseProgramada existente : clasesEnSalon) {
            if (claseIdExcluir != null && existente.getId().equals(claseIdExcluir)) continue;

            Set<String> diasExistente = parsearDias(existente.getDiasSemana());
            Set<String> diasEnComun = interseccion(diasNuevos, diasExistente);

            if (!diasEnComun.isEmpty() && hayTraslape(horaInicio, duracionMinutos,
                    existente.getHoraInicio(), existente.getDuracionMinutos())) {

                String dias = String.join(", ", diasEnComun);
                throw new IllegalArgumentException(
                        "Conflicto de salón: ya existe la clase '" +
                        existente.getDisciplina().getNombre() +
                        "' en ese salón los días " + dias +
                        " de " + existente.getHoraInicio() +
                        " a " + existente.getHoraInicio().plusMinutes(existente.getDuracionMinutos()) + "hs."
                );
            }
        }
    }

    /**
     * Verifica que el profesor no tenga otra clase asignada en el mismo horario.
     */
    public void verificarConflictoProfesor(Long profesorId, String diasSemana,
                                            LocalTime horaInicio, int duracionMinutos,
                                            Long claseIdExcluir) {
        if (profesorId == null) return;

        List<ClaseProgramada> clasesDelProfe = claseRepository.findByProfesorTitularId(profesorId);
        Set<String> diasNuevos = parsearDias(diasSemana);

        for (ClaseProgramada existente : clasesDelProfe) {
            if (claseIdExcluir != null && existente.getId().equals(claseIdExcluir)) continue;

            Set<String> diasExistente = parsearDias(existente.getDiasSemana());
            Set<String> diasEnComun = interseccion(diasNuevos, diasExistente);

            if (!diasEnComun.isEmpty() && hayTraslape(horaInicio, duracionMinutos,
                    existente.getHoraInicio(), existente.getDuracionMinutos())) {

                String dias = String.join(", ", diasEnComun);
                throw new IllegalArgumentException(
                        "Conflicto de profesor: ya tiene asignada la clase '" +
                        existente.getDisciplina().getNombre() +
                        "' los días " + dias +
                        " de " + existente.getHoraInicio() +
                        " a " + existente.getHoraInicio().plusMinutes(existente.getDuracionMinutos()) + "hs."
                );
            }
        }
    }

    /**
     * Verifica que el alumno no esté inscripto en otra clase que se superponga.
     * Usa los días seleccionados por el alumno en cada inscripción (no los días
     * completos de la clase) para una detección precisa.
     */
    public void verificarConflictoAlumno(Long alumnoId, String diasNuevos,
                                          LocalTime horaInicio, int duracionMinutos) {
        List<Inscripcion> inscripcionesActivas = inscripcionRepository.findByAlumnoIdAndActivoTrue(alumnoId);
        Set<String> diasSet = parsearDias(diasNuevos);

        for (Inscripcion inscripcion : inscripcionesActivas) {
            ClaseProgramada claseExistente = inscripcion.getClase();

            // Usar los días que el alumno realmente cursa (puede ser subconjunto)
            String diasAlumnoEnClase = inscripcion.getDiasSeleccionados() != null
                    ? inscripcion.getDiasSeleccionados()
                    : claseExistente.getDiasSemana();

            Set<String> diasExistente = parsearDias(diasAlumnoEnClase);
            Set<String> diasEnComun = interseccion(diasSet, diasExistente);

            if (!diasEnComun.isEmpty() && hayTraslape(horaInicio, duracionMinutos,
                    claseExistente.getHoraInicio(), claseExistente.getDuracionMinutos())) {

                String dias = String.join(", ", diasEnComun);
                throw new IllegalArgumentException(
                        "Conflicto de alumno: ya está inscripto en '" +
                        claseExistente.getDisciplina().getNombre() +
                        "' los días " + dias +
                        " de " + claseExistente.getHoraInicio() +
                        " a " + claseExistente.getHoraInicio().plusMinutes(claseExistente.getDuracionMinutos()) + "hs."
                );
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Helpers privados
    // ─────────────────────────────────────────────────────────────

    /**
     * Detecta solapamiento entre dos rangos horarios.
     * [a_inicio, a_inicio+durA) ∩ [b_inicio, b_inicio+durB) ≠ ∅
     */
    private boolean hayTraslape(LocalTime aInicio, int durA, LocalTime bInicio, int durB) {
        LocalTime aFin = aInicio.plusMinutes(durA);
        LocalTime bFin = bInicio.plusMinutes(durB);
        return aInicio.isBefore(bFin) && bInicio.isBefore(aFin);
    }

    private Set<String> parsearDias(String dias) {
        if (dias == null || dias.isBlank()) return Set.of();
        return Arrays.stream(dias.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(d -> !d.isEmpty())
                .collect(Collectors.toSet());
    }

    private Set<String> interseccion(Set<String> a, Set<String> b) {
        return a.stream().filter(b::contains).collect(Collectors.toSet());
    }
}
