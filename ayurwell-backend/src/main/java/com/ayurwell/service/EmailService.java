package com.ayurwell.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@ayurwell.com}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode, String userName) {
        String subject = "Verify your AyurWell account 🌿";
        String displayName = (userName != null && !userName.trim().isEmpty()) ? userName.trim() : "Valued Member";

        String htmlContent = buildHtmlContent(displayName, otpCode);

        log.info("[AYURWELL OTP MAIL SERVICE] Dispatching real email verification to: {}", toEmail);

        if (mailSender == null) {
            log.error("[AYURWELL OTP MAIL SERVICE] JavaMailSender is not configured in Spring context!");
            throw new RuntimeException("We couldn't send the verification code right now. Please check email provider configuration.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("[AYURWELL OTP MAIL SERVICE] Real verification email successfully delivered to {}", toEmail);
        } catch (Exception e) {
            log.error("[AYURWELL OTP MAIL SERVICE] Failed to deliver email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("We couldn't send the verification code right now. Please check your email configuration or try again.");
        }
    }

    private String buildHtmlContent(String userName, String otpCode) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='utf-8'></head>"
                + "<body style='font-family: Arial, sans-serif; background-color: #f4f7f5; margin: 0; padding: 24px;'>"
                + "  <div style='max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e0eae4; box-shadow: 0 8px 24px rgba(15,47,37,0.06); text-align: center;'>"
                + "    <div style='font-size: 26px; font-weight: bold; color: #0F2F25; font-family: Georgia, serif;'>AyurWell 🌿</div>"
                + "    <div style='font-size: 11px; font-weight: bold; color: #87A96B; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;'>Personalized Ayurvedic Wellness Platform</div>"
                + "    <h2 style='font-size: 20px; color: #0F2F25; margin-top: 24px; font-family: Georgia, serif;'>Verify Your Email</h2>"
                + "    <p style='color: #333333; font-size: 14px; text-align: left; margin-top: 16px;'>Hello <strong>" + userName + "</strong>,</p>"
                + "    <p style='color: #555555; font-size: 14px; text-align: left; line-height: 1.6;'>Thank you for creating your AyurWell account. Please use the 6-digit verification code below to verify your email address and activate your profile:</p>"
                + "    <div style='margin: 28px 0; background: #F3F7F5; padding: 20px; border-radius: 16px; border: 1px solid #D2E2D8; display: inline-block; width: 80%; text-align: center;'>"
                + "      <span style='font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #0F2F25; font-family: monospace; display: block;'>" + otpCode + "</span>"
                + "    </div>"
                + "    <p style='color: #666666; font-size: 13px;'>This code is single-use and expires in <strong>5 minutes</strong>.</p>"
                + "    <p style='color: #888888; font-size: 12px; margin-top: 20px;'>If you did not request this verification code, you can safely ignore this email.</p>"
                + "    <div style='margin-top: 32px; padding-top: 20px; border-top: 1px solid #edf2ef; font-size: 11px; color: #999999;'>"
                + "      © AyurWell Team — Rooted in Ayurveda, Inspired by Wellness"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }
}
