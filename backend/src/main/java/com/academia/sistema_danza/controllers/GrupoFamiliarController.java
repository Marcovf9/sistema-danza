package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.GrupoFamiliar;
import com.academia.sistema_danza.repositories.GrupoFamiliarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grupos-familiares")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GrupoFamiliarController {

    private final GrupoFamiliarRepository grupoFamiliarRepository;

    @GetMapping
    public List<GrupoFamiliar> obtenerTodos() {
        return grupoFamiliarRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<GrupoFamiliar> crear(@RequestBody GrupoFamiliar grupoFamiliar) {
        GrupoFamiliar nuevoGrupo = grupoFamiliarRepository.save(grupoFamiliar);
        return ResponseEntity.ok(nuevoGrupo);
    }
}