package com.academia.sistema_danza.services;

import com.academia.sistema_danza.models.Egreso;
import com.academia.sistema_danza.models.Recibo;
import com.academia.sistema_danza.repositories.EgresoRepository;
import com.academia.sistema_danza.repositories.ReciboRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final ReciboRepository reciboRepository;
    private final EgresoRepository egresoRepository;

    public byte[] generarReporteMensual(int mes, int anio) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            Sheet sheetIngresos = workbook.createSheet("Ingresos");
            Row headerRowIngresos = sheetIngresos.createRow(0);
            String[] colIngresos = {"Fecha", "Nro Recibo", "Alumno", "Método de Pago", "Monto ($)"};
            for (int i = 0; i < colIngresos.length; i++) {
                Cell cell = headerRowIngresos.createCell(i);
                cell.setCellValue(colIngresos[i]);
                cell.setCellStyle(headerStyle);
            }

            List<Recibo> ingresosMes = reciboRepository.findAll().stream()
                    .filter(r -> "PAGADO".equals(r.getEstado().name()) &&
                            r.getFechaEmision().getMonthValue() == mes &&
                            r.getFechaEmision().getYear() == anio)
                    .toList();

            int rowIdx = 1;
            BigDecimal totalIngresos = BigDecimal.ZERO;
            for (Recibo r : ingresosMes) {
                Row row = sheetIngresos.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getFechaEmision().format(formatter));
                row.createCell(1).setCellValue(r.getId());
                row.createCell(2).setCellValue(r.getAlumno().getNombre() + " " + r.getAlumno().getApellido());
                row.createCell(3).setCellValue(r.getMetodoPago().name());
                row.createCell(4).setCellValue(r.getMontoTotal().doubleValue());
                totalIngresos = totalIngresos.add(r.getMontoTotal());
            }
            
            Row rowTotalIngresos = sheetIngresos.createRow(rowIdx + 1);
            rowTotalIngresos.createCell(3).setCellValue("TOTAL INGRESOS:");
            rowTotalIngresos.createCell(4).setCellValue(totalIngresos.doubleValue());

            for (int i = 0; i < colIngresos.length; i++) sheetIngresos.autoSizeColumn(i);

            Sheet sheetEgresos = workbook.createSheet("Egresos");
            Row headerRowEgresos = sheetEgresos.createRow(0);
            String[] colEgresos = {"Fecha", "Concepto", "Observaciones", "Monto ($)"};
            for (int i = 0; i < colEgresos.length; i++) {
                Cell cell = headerRowEgresos.createCell(i);
                cell.setCellValue(colEgresos[i]);
                cell.setCellStyle(headerStyle);
            }

            List<Egreso> egresosMes = egresoRepository.findAll().stream()
                    .filter(e -> e.getFecha().getMonthValue() == mes &&
                            e.getFecha().getYear() == anio)
                    .toList();

            rowIdx = 1;
            BigDecimal totalEgresos = BigDecimal.ZERO;
            for (Egreso e : egresosMes) {
                Row row = sheetEgresos.createRow(rowIdx++);
                row.createCell(0).setCellValue(e.getFecha().format(formatter));
                row.createCell(1).setCellValue(e.getConcepto());
                row.createCell(2).setCellValue(e.getObservaciones() != null ? e.getObservaciones() : "");
                row.createCell(3).setCellValue(e.getMonto().doubleValue());
                totalEgresos = totalEgresos.add(e.getMonto());
            }

            Row rowTotalEgresos = sheetEgresos.createRow(rowIdx + 1);
            rowTotalEgresos.createCell(2).setCellValue("TOTAL EGRESOS:");
            rowTotalEgresos.createCell(3).setCellValue(totalEgresos.doubleValue());

            for (int i = 0; i < colEgresos.length; i++) sheetEgresos.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando el archivo Excel", e);
        }
    }
}