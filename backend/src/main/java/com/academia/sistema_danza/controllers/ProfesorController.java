package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Profesor;
import com.academia.sistema_danza.repositories.ProfesorRepository;
import com.academia.sistema_danza.services.ProfesorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profesores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfesorController {

    private final ProfesorRepository profesorRepository;
    private final ProfesorService profesorService;

    @GetMapping
    public List<Profesor> obtenerTodos() {
        return profesorRepository.findAll();
    }

    @GetMapping("/{id}/liquidacion")
    public ResponseEntity<?> calcularLiquidacion(
            @PathVariable Long id,
            @RequestParam int mes,
            @RequestParam int anio) {
        
        try {
            BigDecimal totalSueldo = profesorService.calcularLiquidacionMensual(id, mes, anio);
            
            return ResponseEntity.ok(Map.of(
                    "profesorId", id,
                    "mes", mes,
                    "anio", anio,
                    "totalAPagar", totalSueldo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al calcular la liquidación: " + e.getMessage()));
        }
    }
}