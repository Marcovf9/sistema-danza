package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Asistencia;
import com.academia.sistema_danza.models.enums.EstadoAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    long countBySesionClaseIdAndEstado(Long sesionClaseId, EstadoAsistencia estado);
}