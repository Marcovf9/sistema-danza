package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.dto.ProfesorRequestDTO;
import com.academia.sistema_danza.dto.ProfesorResponseDTO;
import com.academia.sistema_danza.repositories.LiquidacionProfesorRepository;
import com.academia.sistema_danza.services.PdfService;
import com.academia.sistema_danza.services.ProfesorService;
import jakarta.validation.Valid;
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

    private final ProfesorService profesorService;
    private final LiquidacionProfesorRepository liquidacionRepository;
    private final PdfService pdfService;

    @GetMapping
    public List<ProfesorResponseDTO> obtenerTodos() {
        return profesorService.findAll();
    }

    @PostMapping
    public ResponseEntity<ProfesorResponseDTO> crearProfesor(@Valid @RequestBody ProfesorRequestDTO dto) {
        return ResponseEntity.ok(profesorService.crearProfesor(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfesorResponseDTO> actualizarProfesor(@PathVariable Long id,
                                                                   @Valid @RequestBody ProfesorRequestDTO dto) {
        return ResponseEntity.ok(profesorService.actualizarProfesor(id, dto));
    }

    @PatchMapping("/{id}/baja")
    public ResponseEntity<String> bajaLogicaProfesor(@PathVariable Long id) {
        profesorService.bajaLogica(id);
        return ResponseEntity.ok("Profesor dado de baja. Sus clases ahora están vacantes.");
    }

    @GetMapping("/{id}/liquidacion")
    public ResponseEntity<?> calcularLiquidacion(@PathVariable Long id,
                                                  @RequestParam int mes,
                                                  @RequestParam int anio) {
        try {
            BigDecimal totalSueldo = profesorService.calcularLiquidacionMensual(id, mes, anio);
            return ResponseEntity.ok(Map.of(
                    "profesorId", id, "mes", mes, "anio", anio, "totalAPagar", totalSueldo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al calcular la liquidación: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/liquidaciones/pagar")
    public ResponseEntity<?> pagarLiquidacion(@PathVariable Long id,
                                               @RequestParam int mes,
                                               @RequestParam int anio,
                                               @RequestParam BigDecimal monto) {
        try {
            profesorService.pagarLiquidacion(id, mes, anio, monto);
            return ResponseEntity.ok(Map.of("mensaje", "Liquidación pagada y registrada en caja"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar el pago: " + e.getMessage());
        }
    }

    @GetMapping("/liquidaciones/{id}/pdf")
    public ResponseEntity<byte[]> descargarReciboSueldo(@PathVariable Long id) {
        var liq = liquidacionRepository.findById(id)
                .orElseThrow(() -> new com.academia.sistema_danza.exception.RecursoNoEncontradoException("Liquidación", id));
        byte[] pdf = pdfService.generarReciboSueldoPdf(liq);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Recibo_Sueldo_" + id + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
