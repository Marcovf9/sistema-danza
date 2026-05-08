package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Recibo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReciboRepository extends JpaRepository<Recibo, Long> {
    List<Recibo> findByAlumnoIdOrderByFechaEmisionDesc(Long alumnoId);
}