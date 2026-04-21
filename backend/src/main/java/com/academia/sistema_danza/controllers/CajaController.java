package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Recibo;
import com.academia.sistema_danza.models.enums.EstadoRecibo;
import com.academia.sistema_danza.models.enums.MetodoPago;
import com.academia.sistema_danza.services.CajaService;
import com.academia.sistema_danza.services.FacturacionAutomaticaService;
import com.academia.sistema_danza.services.PdfService;
import com.academia.sistema_danza.repositories.ReciboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CajaController {

    private final CajaService cajaService;
    private final PdfService pdfService;
    private final ReciboRepository reciboRepository;
    private final FacturacionAutomaticaService facturacionRobot;

    @GetMapping("/pendientes")
    public ResponseEntity<List<Recibo>> obtenerRecibosPendientes() {
        List<Recibo> pendientes = reciboRepository.findAll().stream()
                .filter(r -> r.getEstado() == EstadoRecibo.PENDIENTE)
                .toList();
        return ResponseEntity.ok(pendientes);
    }

    @PostMapping("/cobrar-recibo")
    public ResponseEntity<Recibo> cobrarRecibo(
            @RequestParam Long reciboId, 
            @RequestParam MetodoPago metodoPago) {
        
        Recibo reciboPagado = cajaService.cobrarReciboPendiente(reciboId, metodoPago);
        return ResponseEntity.ok(reciboPagado);
    }

    @GetMapping("/recibos/{id}/pdf")
    public ResponseEntity<byte[]> descargarReciboPdf(@PathVariable Long id) {
        Recibo recibo = reciboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recibo no encontrado"));

        byte[] pdfBytes = pdfService.generarReciboPdf(recibo);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Recibo_Epifania_" + id + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // 4. DISPARAR ROBOT MANUALMENTE (Para que hagamos pruebas sin esperar a las 3 AM)
    @PostMapping("/disparar-robot-facturacion")
    public ResponseEntity<String> forzarFacturacionMensual() {
        facturacionRobot.generarCuotasMensualesAutomaticas();
        return ResponseEntity.ok("Robot ejecutado con éxito. Revisa la consola del backend.");
    }
}