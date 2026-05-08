package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.LiquidacionProfesor;
import com.academia.sistema_danza.models.Recibo;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private Image obtenerLogo() {
        try {
            ClassPathResource resource = new ClassPathResource("logo.png");
            Image logo = Image.getInstance(resource.getURL());
            logo.scaleToFit(140, 60);
            return logo;
        } catch (Exception e) {
            return null;
        }
    }

    public byte[] generarReciboPdf(Recibo recibo) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A5, 30, 30, 30, 30);
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font fontLarge = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font fontSmall = FontFactory.getFont(FontFactory.HELVETICA, 8);

            PdfPTable headerTable = new PdfPTable(3);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{4.5f, 1f, 3.5f});

            PdfPCell cellLogo = new PdfPCell();
            cellLogo.setBorder(Rectangle.NO_BORDER);
            Image logo = obtenerLogo();
            if (logo != null) {
                logo.setAlignment(Element.ALIGN_CENTER);
                cellLogo.addElement(logo);
            }
            Paragraph dir = new Paragraph("Valparaíso 3260 | Barrio Jardín\nTel.: 351 5073081", fontSmall);
            dir.setAlignment(Element.ALIGN_CENTER);
            cellLogo.addElement(dir);
            headerTable.addCell(cellLogo);

            PdfPCell cellX = new PdfPCell(new Phrase("X", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24)));
            cellX.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellX.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cellX.setPadding(10);
            headerTable.addCell(cellX);

            PdfPCell cellInfo = new PdfPCell();
            cellInfo.setBorder(Rectangle.NO_BORDER);
            cellInfo.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph txtRecibo = new Paragraph("RECIBO", fontLarge);
            txtRecibo.setAlignment(Element.ALIGN_RIGHT);
            cellInfo.addElement(txtRecibo);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd / MM / yyyy");
            String fechaFormateada = recibo.getFechaEmision() != null ? recibo.getFechaEmision().format(formatter) : "   /   /   ";
            Paragraph txtFecha = new Paragraph("\nFECHA: " + fechaFormateada, fontNormal);
            txtFecha.setAlignment(Element.ALIGN_RIGHT);
            cellInfo.addElement(txtFecha);
            headerTable.addCell(cellInfo);

            document.add(headerTable);
            document.add(new Paragraph("\n"));
            document.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100f, java.awt.Color.BLACK, Element.ALIGN_CENTER, -2f)));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("Señor/a: " + recibo.getAlumno().getNombre() + " " + recibo.getAlumno().getApellido(), fontNormal));
            document.add(new Paragraph("\n"));
            
            String dirText = recibo.getAlumno().getDireccion() != null ? recibo.getAlumno().getDireccion() : "________________________";
            String locText = recibo.getAlumno().getLocalidad() != null ? recibo.getAlumno().getLocalidad() : "________________________";
            String telText = recibo.getAlumno().getTelefono() != null ? recibo.getAlumno().getTelefono() : "______________";
            document.add(new Paragraph("Domicilio: " + dirText, fontNormal));
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Localidad: " + locText + "                        Tel.: " + telText, fontNormal));
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("I.V.A.: _________________________                        C.U.I.L.: " + (recibo.getAlumno().getDni() != null ? recibo.getAlumno().getDni() : "______________"), fontNormal));
            document.add(new Paragraph("\n"));
            document.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100f, java.awt.Color.BLACK, Element.ALIGN_CENTER, -2f)));
            document.add(new Paragraph("\n\n"));

            document.add(new Paragraph("Recibí(mos) la suma de: Pesos " + recibo.getMontoTotal(), fontNormal));
            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("en concepto de: Cuota / Servicios de Academia", fontNormal));
            document.add(new Paragraph("\n\n\n"));

            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);
            footerTable.setWidths(new float[]{1f, 1f});

            PdfPCell cellSon = new PdfPCell(new Phrase("SON $ " + recibo.getMontoTotal(), fontBold));
            cellSon.setHorizontalAlignment(Element.ALIGN_CENTER);
            cellSon.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cellSon.setBackgroundColor(new java.awt.Color(230, 230, 230)); // Fondo gris suave
            cellSon.setPadding(10);
            footerTable.addCell(cellSon);

            PdfPCell cellFirma = new PdfPCell();
            cellFirma.setBorder(Rectangle.NO_BORDER);
            cellFirma.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph txtFirma = new Paragraph("____________________________\nFIRMA\n\n____________________________\nACLARACIÓN", fontSmall);
            txtFirma.setAlignment(Element.ALIGN_CENTER);
            cellFirma.addElement(txtFirma);
            footerTable.addCell(cellFirma);

            document.add(footerTable);
            document.add(new Paragraph("\n"));
            document.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100f, java.awt.Color.BLACK, Element.ALIGN_CENTER, -2f)));
            
            Paragraph finePrint = new Paragraph("Recibo generado por EPIFANIA DANCE SRL.\nRECIBO " + recibo.getId() + "\nwww.epifaniadance.com", fontSmall);
            document.add(finePrint);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF del recibo", e);
        }
    }

    public byte[] generarReciboSueldoPdf(LiquidacionProfesor liquidacion) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A5, 30, 30, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            Image logo = obtenerLogo();
            if (logo != null) {
                logo.setAlignment(Element.ALIGN_CENTER);
                document.add(logo);
            } else {
                Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
                Paragraph titulo = new Paragraph("EPIFANIA DANCE", fontTitulo);
                titulo.setAlignment(Element.ALIGN_CENTER);
                document.add(titulo);
            }

            Font fontSubtitulo = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Paragraph subtitulo = new Paragraph("Comprobante de Pago de Honorarios", fontSubtitulo);
            subtitulo.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitulo);
            document.add(new Paragraph("\n"));

            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            document.add(new Paragraph("Nº de Liquidación: " + String.format("%06d", liquidacion.getId()), fontNormal));
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String fechaFormateada = liquidacion.getFechaGeneracion() != null ? liquidacion.getFechaGeneracion().format(formatter) : "S/D";
            document.add(new Paragraph("Fecha de Pago: " + fechaFormateada, fontNormal));
            document.add(new Paragraph("\n"));
            
            document.add(new Paragraph("Abonamos a favor de:", fontNormal));
            document.add(new Paragraph(liquidacion.getProfesor().getNombre() + " " + liquidacion.getProfesor().getApellido(), fontBold));
            
            if(liquidacion.getProfesor().getCbuAlias() != null && !liquidacion.getProfesor().getCbuAlias().isEmpty()) {
                document.add(new Paragraph("CBU / Alias: " + liquidacion.getProfesor().getCbuAlias(), fontNormal));
            }

            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Concepto: Honorarios Mes " + liquidacion.getMes() + " del Año " + liquidacion.getAnio(), fontNormal));
            document.add(new Paragraph("\n"));

            Font fontTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph total = new Paragraph("TOTAL LIQUIDADO: $" + liquidacion.getTotalBase(), fontTotal);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.add(new Paragraph("\n\n"));
            Font fontPie = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9);
            Paragraph pie = new Paragraph("Copia para el Profesor. Epifania Dance.", fontPie);
            pie.setAlignment(Element.ALIGN_CENTER);
            document.add(pie);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el PDF del sueldo", e);
        }
    }
}