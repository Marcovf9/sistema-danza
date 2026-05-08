package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    List<Alumno> findByActivoTrue();
    Optional<Alumno> findByDni(String dni);
    List<Alumno> findByGrupoFamiliarId(Long grupoFamiliarId);
    long countByActivoTrue();
}