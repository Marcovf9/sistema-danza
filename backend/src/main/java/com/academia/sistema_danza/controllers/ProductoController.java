package com.academia.sistema_danza.controllers;

import com.academia.sistema_danza.models.Producto;
import com.academia.sistema_danza.repositories.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PatchMapping("/{id}/baja")
    public ResponseEntity<?> darDeBaja(@PathVariable Long id) {
        return productoRepository.findById(id).map(prod -> {
            prod.setActivo(false);
            productoRepository.save(prod);
            return ResponseEntity.ok("Producto dado de baja");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}