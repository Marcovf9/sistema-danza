package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Recibo;
import com.academia.sistema_danza.models.Alumno;
import com.academia.sistema_danza.models.enums.EstadoRecibo;
import com.academia.sistema_danza.models.enums.MetodoPago;
import com.academia.sistema_danza.services.AuditoriaService;
import com.academia.sistema_danza.services.CajaService;
import com.academia.sistema_danza.services.EmailService;
import com.academia.sistema_danza.services.FacturacionAutomaticaService;
import com.academia.sistema_danza.services.PdfService;
import com.academia.sistema_danza.repositories.ReciboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.academia.sistema_danza.models.Egreso;
import com.academia.sistema_danza.repositories.EgresoRepository;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Sort;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
    private final EmailService emailService;

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
        Alumno alumno = reciboPagado.getAlumno();
        
        auditoriaService.registrarAccion(
            "COBRO_CUOTA", "Recibo", reciboPagado.getId(), 
            "Se cobró $" + reciboPagado.getMontoTotal() + " al alumno " + alumno.getNombre() + " mediante " + metodoPago.name()
        );

        String emailDestino = alumno.getEmail();
        String nombreDestino = alumno.getNombre();

        if (Boolean.TRUE.equals(alumno.getEsMenor()) && alumno.getTutor() != null) {
            emailDestino = alumno.getTutor().getEmail();
            nombreDestino = alumno.getTutor().getNombre();
        }

        try {
            byte[] pdf = pdfService.generarReciboPdf(reciboPagado);
            emailService.enviarConfirmacionPago(
                emailDestino,
                nombreDestino,
                reciboPagado.getMontoTotal().toString(),
                reciboPagado.getId().toString(),
                pdf, 
                "Recibo_Epifania_" + reciboPagado.getId() + ".pdf"
            );
        } catch (Exception e) {
            System.err.println("No se pudo enviar el recibo por email: " + e.getMessage());
        }

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
    public ResponseEntity<?> registrarEgreso(@RequestBody Egreso egreso) {
        try {
            egreso.setFecha(LocalDateTime.now());
            Egreso nuevoEgreso = egresoRepository.save(egreso);
            return ResponseEntity.ok(nuevoEgreso);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar el egreso: " + e.getMessage());
        }
    }

    @GetMapping("/recibos/alumno/{alumnoId}")
    public ResponseEntity<List<Recibo>> obtenerHistorialAlumno(@PathVariable Long alumnoId) {
        return ResponseEntity.ok(reciboRepository.findByAlumnoIdOrderByFechaEmisionDesc(alumnoId));
    }


    @GetMapping("/limpiar-duplicados")
    @Transactional
    public ResponseEntity<String> limpiarRecibosDuplicados() {
        int mesActual = LocalDate.now().getMonthValue();
        int anioActual = LocalDate.now().getYear();
        
        List<Recibo> todosPendientes = reciboRepository.findAll().stream()
                .filter(r -> r.getEstado() == EstadoRecibo.PENDIENTE &&
                             r.getFechaEmision().getMonthValue() == mesActual &&
                             r.getFechaEmision().getYear() == anioActual)
                .toList();
                
        Map<Long, List<Recibo>> recibosPorAlumno = todosPendientes.stream()
                .collect(Collectors.groupingBy(r -> r.getAlumno().getId()));
                
        int borrados = 0;
        
        for (List<Recibo> recibosDelAlumno : recibosPorAlumno.values()) {
            if (recibosDelAlumno.size() > 1) {
                for (int i = 1; i < recibosDelAlumno.size(); i++) {
                    reciboRepository.delete(recibosDelAlumno.get(i));
                    borrados++;
                }
            }
        }
        
        return ResponseEntity.ok("¡Limpieza completada! Se eliminaron " + borrados + " recibos duplicados de tu base de datos.");
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