package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfesorRepository extends JpaRepository<Profesor, Long> {
    Optional<Profesor> findByUsuarioId(Long usuarioId);
}