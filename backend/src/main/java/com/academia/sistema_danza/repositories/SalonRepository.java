package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Salon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalonRepository extends JpaRepository<Salon, Long> {
}