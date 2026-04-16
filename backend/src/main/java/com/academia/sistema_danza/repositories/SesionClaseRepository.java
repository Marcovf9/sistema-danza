package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.SesionClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SesionClaseRepository extends JpaRepository<SesionClase, Long> {
    @Query("SELECT s FROM SesionClase s WHERE s.profesorDictante.id = :profesorId AND MONTH(s.fecha) = :mes AND YEAR(s.fecha) = :anio")
    List<SesionClase> findByProfesorDictanteIdAndMesAnio(@Param("profesorId") Long profesorId, @Param("mes") int mes, @Param("anio") int anio);
}