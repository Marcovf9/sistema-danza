package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.repositories.AlumnoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
@CrossOrigin(origins = "*")
public class AlumnoController {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @GetMapping
    public List<Alumno> obtenerTodos() {
        return alumnoRepository.findAll();
    }

    @PostMapping
    public Alumno guardarAlumno(@RequestBody Alumno alumno) {
        return alumnoRepository.save(alumno);
    }
}