package com.academia.sistema_danza.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarCorreoRecordatorio(String destinatario, String nombreAlumno, String monto, Long reciboId) {
        if (destinatario == null || destinatario.isEmpty()) return;

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject("Aviso de Cuota Pendiente \uD83D\uDCDD - Epifania Dance");

            String htmlMsg = "<!DOCTYPE html>"
                    + "<html lang='es'>"
                    + "<body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>"
                    + "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>"
                    + "<tr><td align='center'>"
                    + "<table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>"
                    + ""
                    + "<tr><td align='center' style='background-color: #4f46e5; padding: 40px 20px;'>"
                    + "<img src='https://i.imgur.com/tu_logo_aqui.png' alt='Epifania Dance' style='max-width: 180px; display: block; margin-bottom: 10px;' />"
                    + "<h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>EPIFANIA DANCE</h1>"
                    + "</td></tr>"
                    + ""
                    + "<tr><td style='padding: 40px 40px 20px 40px; color: #374151;'>"
                    + "<h2 style='color: #1f2937; font-size: 20px; margin-top: 0;'>¡Hola!</h2>"
                    + "<p style='font-size: 16px; line-height: 1.6; color: #4b5563;'>Te escribimos para recordarte que el recibo <strong>#" + String.format("%05d", reciboId) + "</strong> correspondiente al alumno/a <strong>" + nombreAlumno + "</strong> se encuentra pendiente de pago.</p>"
                    + "<div style='background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;'>"
                    + "<p style='margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;'>Total a Abonar</p>"
                    + "<p style='margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #10b981;'>$" + monto + "</p>"
                    + "</div>"
                    + "<p style='font-size: 16px; line-height: 1.6; color: #4b5563;'>Si ya realizaste el pago mediante transferencia, por favor envíanos el comprobante por WhatsApp. Si abonás en efectivo, te esperamos por la academia.</p>"
                    + "</td></tr>"
                    + ""
                    + "<tr><td align='center' style='padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;'>"
                    + "<p style='margin: 0; font-size: 12px; color: #94a3b8;'>Este es un mensaje generado automáticamente por el sistema de gestión. Por favor no respondas a este correo.</p>"
                    + "</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "</table>"
                    + "</body>"
                    + "</html>";

            helper.setText(htmlMsg, true);
            mailSender.send(mensaje);
            log.info("📧 Correo profesional enviado a: " + destinatario);

        } catch (Exception e) {
            log.error("❌ Error al enviar correo a " + destinatario, e);
        }
    }
}