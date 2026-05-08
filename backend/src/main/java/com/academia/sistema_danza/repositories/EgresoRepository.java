package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Egreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EgresoRepository extends JpaRepository<Egreso, Long> {
}