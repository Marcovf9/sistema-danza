package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.dto.PedidoItemDTO;
import com.academia.sistema_danza.exception.RecursoNoEncontradoException;
import com.academia.sistema_danza.models.Producto;
import com.academia.sistema_danza.repositories.ProductoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> obtenerTodosActivos() {
        return productoRepository.findByActivoTrue();
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        producto.setActivo(true);
        
        if (producto.getImagenes() != null) {
            producto.getImagenes().forEach(img -> img.setProducto(producto));
        }
        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto datos) {
        return productoRepository.findById(id).map(prod -> {
            prod.setNombre(datos.getNombre());
            prod.setDescripcion(datos.getDescripcion());
            prod.setPrecio(datos.getPrecio());
            prod.setStock(datos.getStock());
            prod.setCategoria(datos.getCategoria());
            
            prod.getImagenes().clear();
            if (datos.getImagenes() != null) {
                datos.getImagenes().forEach(img -> {
                    img.setProducto(prod);
                    prod.getImagenes().add(img);
                });
            }
            
            productoRepository.save(prod);
            return ResponseEntity.ok(prod);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Confirma un pedido del portal alumno: valida el stock de cada ítem
     * y lo descuenta atómicamente. Si algún producto no tiene stock suficiente
     * se lanza IllegalArgumentException y toda la transacción se revierte.
     */
    @PostMapping("/pedido")
    @Transactional
    public ResponseEntity<Map<String, String>> confirmarPedido(
            @Valid @RequestBody List<PedidoItemDTO> items) {

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("El pedido no puede estar vacío.");
        }

        for (PedidoItemDTO item : items) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto", item.getProductoId()));

            if (!producto.getActivo()) {
                throw new IllegalArgumentException("El producto '" + producto.getNombre() + "' ya no está disponible.");
            }

            if (producto.getStock() < item.getCantidad()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para '" + producto.getNombre() +
                        "'. Disponible: " + producto.getStock() + ", solicitado: " + item.getCantidad() + ".");
            }

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);
        }

        return ResponseEntity.ok(Map.of("mensaje", "Pedido confirmado. El stock fue actualizado."));
    }

    @PatchMapping("/{id}/baja")
    public ResponseEntity<?> darDeBaja(@PathVariable Long id) {
        return productoRepository.findById(id).map(prod -> {
            prod.setActivo(false);
            productoRepository.save(prod);
            return ResponseEntity.ok("Producto dado de baja");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}