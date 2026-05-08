package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.LiquidacionProfesor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiquidacionProfesorRepository extends JpaRepository<LiquidacionProfesor, Long> {
}