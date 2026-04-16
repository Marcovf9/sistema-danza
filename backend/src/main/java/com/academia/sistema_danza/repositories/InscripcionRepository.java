package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    List<Inscripcion> findByAlumnoIdAndActivoTrue(Long alumnoId);
}