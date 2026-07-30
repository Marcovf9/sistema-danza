package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.dto.EgresoRequestDTO;
import com.academia.sistema_danza.dto.ReciboResponseDTO;
import com.academia.sistema_danza.models.Egreso;
import com.academia.sistema_danza.models.Recibo;
import com.academia.sistema_danza.models.enums.EstadoRecibo;
import com.academia.sistema_danza.models.enums.MetodoPago;
import com.academia.sistema_danza.repositories.EgresoRepository;
import com.academia.sistema_danza.repositories.ReciboRepository;
import com.academia.sistema_danza.services.AuditoriaService;
import com.academia.sistema_danza.services.CajaService;
import com.academia.sistema_danza.services.FacturacionAutomaticaService;
import com.academia.sistema_danza.services.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CajaController {

    private final CajaService cajaService;
    private final PdfService pdfService;
    private final ReciboRepository reciboRepository;
    private final FacturacionAutomaticaService facturacionRobot;
    private final EgresoRepository egresoRepository;
    private final AuditoriaService auditoriaService;

    @GetMapping("/pendientes")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReciboResponseDTO>> obtenerRecibosPendientes() {
        List<ReciboResponseDTO> pendientes = reciboRepository.findAll().stream()
                .filter(r -> r.getEstado() == EstadoRecibo.PENDIENTE)
                .map(cajaService::toReciboDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendientes);
    }

    @PostMapping("/cobrar-recibo")
    @Transactional
    public ResponseEntity<ReciboResponseDTO> cobrarRecibo(
            @RequestParam Long reciboId,
            @RequestParam MetodoPago metodoPago) {

        Recibo reciboPagado = cajaService.cobrarReciboPendiente(reciboId, metodoPago);

        auditoriaService.registrarAccion(
                "COBRO_CUOTA",
                "Recibo",
                reciboPagado.getId(),
                "Se cobró $" + reciboPagado.getMontoTotal() + " al alumno "
                        + reciboPagado.getAlumno().getNombre() + " " + reciboPagado.getAlumno().getApellido()
                        + " mediante " + metodoPago.name()
        );

        return ResponseEntity.ok(cajaService.toReciboDTO(reciboPagado));
    }

    @GetMapping("/recibos/{id}/pdf")
    public ResponseEntity<byte[]> descargarReciboPdf(@PathVariable Long id) {
        Recibo recibo = reciboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recibo no encontrado con id: " + id));

        byte[] pdfBytes = pdfService.generarReciboPdf(recibo);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Recibo_Epifania_" + id + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/disparar-robot-facturacion")
    public ResponseEntity<String> forzarFacturacionMensual() {
        facturacionRobot.generarCuotasMensualesAutomaticas();
        facturacionRobot.notificarDeudoresAutomaticamente();
        return ResponseEntity.ok("Simulación completa: Se generaron las cuotas, se aplicó la mora y se enviaron los correos.");
    }

    @GetMapping("/egresos")
    public ResponseEntity<List<Egreso>> obtenerEgresos() {
        return ResponseEntity.ok(egresoRepository.findAll(Sort.by(Sort.Direction.DESC, "fecha")));
    }

    @PostMapping("/egresos")
    public ResponseEntity<Egreso> registrarEgreso(@Valid @RequestBody EgresoRequestDTO dto) {
        Egreso egreso = Egreso.builder()
                .concepto(dto.getConcepto())
                .monto(dto.getMonto())
                .observaciones(dto.getObservaciones())
                .fecha(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(egresoRepository.save(egreso));
    }

    @GetMapping("/recibos/alumno/{alumnoId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReciboResponseDTO>> obtenerHistorialAlumno(@PathVariable Long alumnoId) {
        List<ReciboResponseDTO> historial = reciboRepository
                .findByAlumnoIdOrderByFechaEmisionDesc(alumnoId).stream()
                .map(cajaService::toReciboDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(historial);
    }

    @DeleteMapping("/recibos/{id}")
    @Transactional
    public ResponseEntity<?> anularRecibo(@PathVariable Long id) {
        try {
            reciboRepository.deleteById(id);
            return ResponseEntity.ok("Recibo anulado con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al anular: " + e.getMessage());
        }
    }

    @DeleteMapping("/egresos/{id}")
    @Transactional
    public ResponseEntity<?> eliminarEgreso(@PathVariable Long id) {
        try {
            egresoRepository.deleteById(id);
            return ResponseEntity.ok("Gasto eliminado con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar el gasto: " + e.getMessage());
        }
    }
}
