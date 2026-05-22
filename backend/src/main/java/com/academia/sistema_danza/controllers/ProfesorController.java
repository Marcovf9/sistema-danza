package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.dto.ProfesorRequestDTO;
import com.academia.sistema_danza.dto.ProfesorResponseDTO;
import com.academia.sistema_danza.models.*;
import com.academia.sistema_danza.models.enums.EstadoLiquidacion;
import com.academia.sistema_danza.models.enums.RolUsuario;
import com.academia.sistema_danza.repositories.*;
import com.academia.sistema_danza.services.PdfService;
import com.academia.sistema_danza.services.ProfesorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private final LiquidacionProfesorRepository liquidacionRepository;
    private final EgresoRepository egresoRepository;
    private final PdfService pdfService;

    @GetMapping
    public List<ProfesorResponseDTO> obtenerTodos() {
        return profesorRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ProfesorResponseDTO> crearProfesor(@Valid @RequestBody ProfesorRequestDTO dto) {
        Usuario nuevoUsuario = Usuario.builder()
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .rol(RolUsuario.PROFESOR)
                .requiereCambioPassword(true)
                .build();
        usuarioRepository.save(nuevoUsuario);

        Profesor nuevoProfesor = Profesor.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .cbuAlias(dto.getCbuAlias())
                .usuarioId(nuevoUsuario.getId())
                .build();
        profesorRepository.save(nuevoProfesor);

        return ResponseEntity.ok(toResponseDTO(nuevoProfesor, dto.getEmail()));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ProfesorResponseDTO> actualizarProfesor(@PathVariable Long id, @Valid @RequestBody ProfesorRequestDTO dto) {
        Profesor profe = profesorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado con id: " + id));
        profe.setNombre(dto.getNombre());
        profe.setApellido(dto.getApellido());
        profe.setCbuAlias(dto.getCbuAlias());
        profesorRepository.save(profe);

        Usuario usuario = usuarioRepository.findById(profe.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario del profesor no encontrado"));
        usuario.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(toResponseDTO(profe, dto.getEmail()));
    }

    @PatchMapping("/{id}/baja")
    @Transactional
    public ResponseEntity<String> bajaLogicaProfesor(@PathVariable Long id) {
        Profesor profe = profesorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado con id: " + id));

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
    @Transactional
    public ResponseEntity<?> pagarLiquidacion(@PathVariable Long id,
                                               @RequestParam int mes,
                                               @RequestParam int anio,
                                               @RequestParam BigDecimal monto) {
        try {
            Profesor profesor = profesorRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Profesor no encontrado con id: " + id));

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
        LiquidacionProfesor liq = liquidacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Liquidación no encontrada con id: " + id));
        byte[] pdf = pdfService.generarReciboSueldoPdf(liq);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Recibo_Sueldo_" + id + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    private ProfesorResponseDTO toResponseDTO(Profesor p) {
        String email = null;
        if (p.getUsuarioId() != null) {
            email = usuarioRepository.findById(p.getUsuarioId())
                    .map(Usuario::getEmail)
                    .orElse(null);
        }
        return toResponseDTO(p, email);
    }

    private ProfesorResponseDTO toResponseDTO(Profesor p, String email) {
        return ProfesorResponseDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .apellido(p.getApellido())
                .email(email)
                .cbuAlias(p.getCbuAlias())
                .activo(p.getActivo())
                .usuarioId(p.getUsuarioId())
                .build();
    }
}
