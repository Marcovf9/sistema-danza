package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Recibo;
import com.academia.sistema_danza.models.enums.MetodoPago;
import com.academia.sistema_danza.services.CajaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CajaController {

    private final CajaService cajaService;

    @PostMapping("/cobrar-cuota")
    public ResponseEntity<Recibo> cobrarCuota(
            @RequestParam Long alumnoId, 
            @RequestParam MetodoPago metodoPago) {
        
        Recibo nuevoRecibo = cajaService.generarReciboCuotaMensual(alumnoId, metodoPago);
        return ResponseEntity.ok(nuevoRecibo);
    }
}