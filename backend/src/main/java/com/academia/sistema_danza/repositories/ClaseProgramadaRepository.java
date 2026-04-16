package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.ClaseProgramada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaseProgramadaRepository extends JpaRepository<ClaseProgramada, Long> {
    List<ClaseProgramada> findByDiasSemana(String diaSemana);
}