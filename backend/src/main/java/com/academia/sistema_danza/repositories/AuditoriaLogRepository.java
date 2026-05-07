package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.AuditoriaLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;
import java.util.List;

public interface AuditoriaLogRepository extends JpaRepository<AuditoriaLog, Long> {
    List<AuditoriaLog> findAll(Sort sort);
}