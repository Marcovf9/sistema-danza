package com.academia.sistema_danza.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void enviarEmailResetPassword(String destinatario, String linkReset) {
        if (destinatario == null || destinatario.isEmpty()) return;

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject("Recuperación de contraseña 🔐 - Epifania Dance");

            String htmlMsg = "<!DOCTYPE html>"
                    + "<html lang='es'>"
                    + "<body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>"
                    + "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>"
                    + "<tr><td align='center'>"
                    + "<table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>"
                    + "<tr><td align='center' style='background-color: #4f46e5; padding: 40px 20px;'>"
                    + "<h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>EPIFANIA DANCE</h1>"
                    + "<p style='color: #c7d2fe; margin: 8px 0 0 0; font-size: 14px;'>Sistema de Gestión</p>"
                    + "</td></tr>"
                    + "<tr><td style='padding: 40px 40px 20px 40px; color: #374151;'>"
                    + "<h2 style='color: #1f2937; font-size: 20px; margin-top: 0;'>Recuperación de contraseña</h2>"
                    + "<p style='font-size: 16px; line-height: 1.6; color: #4b5563;'>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el botón para crear una nueva contraseña:</p>"
                    + "<div style='text-align: center; margin: 40px 0;'>"
                    + "<a href='" + linkReset + "' style='display: inline-block; padding: 16px 36px; background-color: #4f46e5; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none; border-radius: 10px; letter-spacing: 0.5px;'>Restablecer contraseña</a>"
                    + "</div>"
                    + "<p style='font-size: 13px; color: #9ca3af; line-height: 1.5;'>Este enlace vence en <strong>1 hora</strong>. Si no solicitaste este cambio, podés ignorar este mensaje. Tu contraseña actual no se modificará.</p>"
                    + "<p style='font-size: 12px; color: #d1d5db; word-break: break-all; margin-top: 16px;'>O copiá este link: <a href='" + linkReset + "' style='color: #818cf8;'>" + linkReset + "</a></p>"
                    + "</td></tr>"
                    + "<tr><td align='center' style='padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;'>"
                    + "<p style='margin: 0; font-size: 12px; color: #94a3b8;'>Este es un mensaje automático del sistema. Por favor no respondas a este correo.</p>"
                    + "</td></tr>"
                    + "</table></td></tr></table>"
                    + "</body></html>";

            helper.setText(htmlMsg, true);
            mailSender.send(mensaje);
            log.info("📧 Email de recuperación enviado a: {}", destinatario);

        } catch (Exception e) {
            log.error("❌ Error al enviar email de recuperación a {}", destinatario, e);
        }
    }

    private String formatearMonto(String montoStr) {
        try {
            BigDecimal monto = new BigDecimal(montoStr);
            NumberFormat formatoAr = NumberFormat.getNumberInstance(new Locale("es", "AR"));
            formatoAr.setMinimumFractionDigits(2);
            formatoAr.setMaximumFractionDigits(2);
            return "$" + formatoAr.format(monto);
        } catch (Exception e) {
            return "$" + montoStr;
        }
    }

    private String generarHtmlBase(String titulo, String contenidoPrincipal, String destacadoEtiqueta, String destacadoValor) {
        return "<!DOCTYPE html><html lang='es'><body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>"
                + "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f3f4f6; padding: 40px 0;'>"
                + "<tr><td align='center'><table width='600' border='0' cellspacing='0' cellpadding='0' style='background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>"
                + "<tr><td align='center' style='background-color: #4f46e5; padding: 40px 20px;'>"
                + "<img src='https://i.imgur.com/tu_logo_aqui.png' alt='Epifania Dance' style='max-width: 180px; display: block; margin-bottom: 10px;' />"
                + "<h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;'>EPIFANIA DANCE</h1></td></tr>"
                + "<tr><td style='padding: 40px 40px 20px 40px; color: #374151;'>"
                + "<h2 style='color: #1f2937; font-size: 20px; margin-top: 0;'>" + titulo + "</h2>"
                + contenidoPrincipal
                + "<div style='background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;'>"
                + "<p style='margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;'>" + destacadoEtiqueta + "</p>"
                + "<p style='margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #10b981;'>" + destacadoValor + "</p></div>"
                + "</td></tr>"
                + "<tr><td align='center' style='padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;'>"
                + "<p style='margin: 0 0 10px 0; font-size: 14px; color: #4b5563;'><b>Seguinos en redes:</b></p>"
                + "<p style='margin: 0; font-size: 13px; color: #6366f1;'>"
                + "📸 Instagram: <a href='https://instagram.com/epifaniadance' style='color: #6366f1; text-decoration: none;'>@epifaniadance</a> | "
                + "💬 WhatsApp: <a href='https://wa.me/5493515073081' style='color: #6366f1; text-decoration: none;'>351 5073081</a>"
                + "</p>"
                + "<p style='margin: 20px 0 0 0; font-size: 11px; color: #94a3b8;'>Mensaje automático del Sistema de Gestión. No responder a este correo.</p>"
                + "</td></tr></table></td></tr></table></body></html>";
    }

    public void notificarInscripcionDirectora(String nombreAlumno, String disciplina) {
        String cuerpo = "<p style='font-size: 16px; line-height: 1.6; color: #4b5563;'>Se ha registrado un nuevo alumno en una clase desde el portal.</p>";
        String html = generarHtmlBase("¡Nueva Inscripción! 🎉", cuerpo, "Alumno y Disciplina", nombreAlumno + " - " + disciplina);
        enviarMimeMail("epifaniadanceart@gmail.com", "Nueva Inscripción: " + nombreAlumno, html, null, null);
    }

    public void enviarConfirmacionPago(String destinatario, String nombre, String monto, String nroComprobante, byte[] pdf, String fileName) {
        String cuerpo = "<p style='font-size: 16px; line-height: 1.6; color: #4b5563;'>Hola <b>" + nombre + "</b>, confirmamos la recepción de tu pago. Adjuntamos el comprobante oficial a este correo.</p>";
        String html = generarHtmlBase("Pago Confirmado 🧾", cuerpo, "Monto Abonado", formatearMonto(monto));
        enviarMimeMail(destinatario, "Comprobante de Pago - Epifania Dance", html, pdf, fileName);
    }

    public void enviarCorreoRecordatorio(String destinatario, String nombreAlumno, String monto, Long reciboId) {
        if (destinatario == null || destinatario.isEmpty()) return;

        String cuerpo = "<p style='font-size: 16px; line-height: 1.6; color: #4b5563;'>Te recordamos que el recibo <b>#" + String.format("%05d", reciboId) + "</b> de <b>" + nombreAlumno + "</b> está pendiente.</p>";
        String html = generarHtmlBase("Aviso de Cuota Pendiente 📝", cuerpo, "Total a Abonar", formatearMonto(monto));
        enviarMimeMail(destinatario, "Aviso de Cuota Pendiente - Epifania Dance", html, null, null);
    }

    private void enviarMimeMail(String to, String subject, String html, byte[] attachment, String fileName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            if (attachment != null) helper.addAttachment(fileName, new ByteArrayResource(attachment));
            mailSender.send(message);
        } catch (Exception e) { log.error("Error enviando mail a {}: {}", to, e.getMessage()); }
    }
}
