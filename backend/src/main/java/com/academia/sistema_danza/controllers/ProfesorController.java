package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.ClaseProgramada;
import com.academia.sistema_danza.models.Profesor;
import com.academia.sistema_danza.models.Usuario;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.ClaseProgramadaRepository;
import com.academia.sistema_danza.repositories.ProfesorRepository;
import com.academia.sistema_danza.repositories.UsuarioRepository;
import com.academia.sistema_danza.services.PdfService;
import com.academia.sistema_danza.services.ProfesorService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.academia.sistema_danza.models.Egreso;
import com.academia.sistema_danza.models.LiquidacionProfesor;
import com.academia.sistema_danza.models.enums.EstadoLiquidacion;
import com.academia.sistema_danza.repositories.EgresoRepository;
import com.academia.sistema_danza.repositories.LiquidacionProfesorRepository;
import java.time.LocalDateTime;
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
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClaseProgramadaRepository claseProgramadaRepository;
    @Autowired
    private LiquidacionProfesorRepository liquidacionRepository;
    @Autowired
    private EgresoRepository egresoRepository;
    @Autowired
    private PdfService pdfService;

    @GetMapping
    public List<Profesor> obtenerTodos() {
        return profesorRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> crearProfesor(@RequestBody Map<String, String> payload) {
        Usuario nuevoUsuario = Usuario.builder()
                .email(payload.get("email"))
                .passwordHash(passwordEncoder.encode(payload.get("password")))
                .rol(RolUsuario.PROFESOR)
                .requiereCambioPassword(true)
                .build();
        usuarioRepository.save(nuevoUsuario);

        Profesor nuevoProfesor = Profesor.builder()
                .nombre(payload.get("nombre"))
                .apellido(payload.get("apellido"))
                .cbuAlias(payload.get("cbuAlias"))
                .usuarioId(nuevoUsuario.getId())
                .build();
        profesorRepository.save(nuevoProfesor);

        return ResponseEntity.ok(nuevoProfesor);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> actualizarProfesor(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Profesor profe = profesorRepository.findById(id).orElseThrow();
        profe.setNombre(payload.get("nombre"));
        profe.setApellido(payload.get("apellido"));
        profe.setCbuAlias(payload.get("cbuAlias"));
        profesorRepository.save(profe);

        Usuario usuario = usuarioRepository.findById(profe.getUsuarioId()).orElseThrow();
        usuario.setEmail(payload.get("email"));
        
        if(payload.get("password") != null && !payload.get("password").isEmpty()) {
            usuario.setPasswordHash(passwordEncoder.encode(payload.get("password")));
        }
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(profe);
    }

    @PatchMapping("/{id}/baja")
    @Transactional
    public ResponseEntity<?> bajaLogicaProfesor(@PathVariable Long id) {
        Profesor profe = profesorRepository.findById(id).orElseThrow();

        profe.setActivo(false);
        profesorRepository.save(profe);

        List<ClaseProgramada> clasesDelProfe = claseProgramadaRepository.findByProfesorTitularId(id);
        for (ClaseProgramada clase : clasesDelProfe) {
            clase.setProfesorTitular(null);
            claseProgramadaRepository.save(clase);
        }

        if (profe.getUsuarioId() != null) {
            usuarioRepository.deleteById(profe.getUsuarioId());
            profe.setUsuarioId(null);
            profesorRepository.save(profe);
        }

        return ResponseEntity.ok("Profesor dado de baja. Sus clases ahora están vacantes.");
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

    @PostMapping("/{id}/liquidaciones/pagar")
    @Transactional
    public ResponseEntity<?> pagarLiquidacion(
            @PathVariable Long id,
            @RequestParam int mes,
            @RequestParam int anio,
            @RequestParam BigDecimal monto) {
        try {
            Profesor profesor = profesorRepository.findById(id).orElseThrow();

            LiquidacionProfesor liq = LiquidacionProfesor.builder()
                    .profesor(profesor)
                    .mes(mes)
                    .anio(anio)
                    .totalBase(monto)
                    .totalComisiones(BigDecimal.ZERO)
                    .estado(EstadoLiquidacion.PAGADO)
                    .build();
            liquidacionRepository.save(liq);

            Egreso gastoComision = Egreso.builder()
                    .concepto("Sueldo Prof: " + profesor.getNombre() + " " + profesor.getApellido())
                    .monto(monto)
                    .fecha(LocalDateTime.now())
                    .observaciones("Liquidación Mes " + mes + " / " + anio)
                    .build();
            egresoRepository.save(gastoComision);

            return ResponseEntity.ok(Map.of("mensaje", "Liquidación pagada y registrada en caja"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar el pago: " + e.getMessage());
        }
    }
    
    @GetMapping("/liquidaciones/{id}/pdf")
    public ResponseEntity<byte[]> descargarReciboSueldo(@PathVariable Long id) {
        LiquidacionProfesor liq = liquidacionRepository.findById(id).orElseThrow();
        byte[] pdf = pdfService.generarReciboSueldoPdf(liq);
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Recibo_Sueldo_" + id + ".pdf");
        
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}