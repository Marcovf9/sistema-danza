package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.PagoAlumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagoAlumnoRepository extends JpaRepository<PagoAlumno, Long> {
    // Para ver el historial de pagos de un alumno en particular
    List<PagoAlumno> findByAlumnoId(Long alumnoId);
}