package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.Recibo;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public byte[] generarReciboPdf(Recibo recibo) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Document document = new Document(PageSize.A5, 30, 30, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph titulo = new Paragraph("EPIFANIA DANCE", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Paragraph subtitulo = new Paragraph("Recibo Oficial de Pago", fontSubtitulo);
            subtitulo.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitulo);

            document.add(new Paragraph("\n")); // Salto de línea

            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            document.add(new Paragraph("N° de Comprobante: " + String.format("%08d", recibo.getId()), fontNormal));
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String fechaFormateada = recibo.getFechaEmision() != null ? recibo.getFechaEmision().format(formatter) : "S/D";
            document.add(new Paragraph("Fecha de Emisión: " + fechaFormateada, fontNormal));
            
            document.add(new Paragraph("Método de Pago: " + recibo.getMetodoPago(), fontNormal));
            document.add(new Paragraph("\n"));
            
            document.add(new Paragraph("Recibimos de:", fontNormal));
            document.add(new Paragraph(recibo.getAlumno().getNombre() + " " + recibo.getAlumno().getApellido(), fontBold));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Concepto: Pago de cuota/servicios", fontNormal));
            document.add(new Paragraph("\n"));

            Font fontTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph total = new Paragraph("TOTAL ABONADO: $" + recibo.getMontoTotal(), fontTotal);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.add(new Paragraph("\n\n"));
            Font fontPie = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9);
            Paragraph pie = new Paragraph("Este documento es un comprobante de pago interno. Epifania Dance.", fontPie);
            pie.setAlignment(Element.ALIGN_CENTER);
            document.add(pie);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error catastrófico al generar el PDF del recibo", e);
        }
    }
}