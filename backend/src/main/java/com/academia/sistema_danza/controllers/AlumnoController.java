package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.dto.AlumnoRequestDTO;
import com.academia.sistema_danza.dto.AlumnoResponseDTO;
import com.academia.sistema_danza.services.AlumnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlumnoController {

    private final AlumnoService alumnoService;

    @GetMapping
    public List<AlumnoResponseDTO> obtenerTodos() {
        return alumnoService.findAll();
    }

    @PostMapping
    public AlumnoResponseDTO guardarAlumno(@Valid @RequestBody AlumnoRequestDTO dto) {
        return alumnoService.crearAlumno(dto);
    }

    @PutMapping("/{id}")
    public AlumnoResponseDTO actualizarAlumno(@PathVariable Long id, @Valid @RequestBody AlumnoRequestDTO dto) {
        return alumnoService.actualizarAlumno(id, dto);
    }

    @PatchMapping("/{id}/baja")
    public void bajaLogica(@PathVariable Long id) {
        alumnoService.bajaLogica(id);
    }
}
