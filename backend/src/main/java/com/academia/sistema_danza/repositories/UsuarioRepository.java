package com.academia.sistema_danza.repositories;

import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.models.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    boolean existsByRol(RolUsuario rol);

    List<Usuario> findByRol(RolUsuario rol);
}