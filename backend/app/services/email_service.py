import json
import logging
import smtplib
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger("skillsync.email")


def generate_amazon_style_html(otp_code: str, purpose: str = "login", email: str = "") -> str:
    """
    Generates an Amazon-style responsive HTML email for OTP verification.
    """
    action_text = (
        "complete your Two-Step Verification sign-in"
        if purpose == "login"
        else "verify your email and create your SkillSync AI account"
    )
    title_text = (
        "Two-Step Verification"
        if purpose == "login"
        else "Verify your email address"
    )

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title_text}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f6f7fb; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden;" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 36px; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SkillSync AI</h1>
              <p style="margin: 4px 0 0; color: #e0e7ff; font-size: 13px; font-weight: 500;">Career Intelligence & Placement Platform</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;">{title_text}</h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
                Use the following One-Time Password (OTP) to {action_text}. This code is valid for <strong>1 minute</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #3730a3; margin: 0;">
                  {otp_code}
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500;">
                  (Do not share this code with anyone)
                </div>
              </div>
              <p style="margin: 0 0 16px; color: #64748b; font-size: 13px; line-height: 1.5;">
                If you did not make this request, you can safely ignore this email. Someone may have entered your email by mistake.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © 2026 SkillSync AI. All rights reserved. Automated security notification.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


from email_validator import validate_email, EmailNotValidError


def validate_email_deliverability(email: str) -> str:
    """
    Validates that the email address syntax is correct and that the domain
    has valid MX DNS records capable of receiving mail.
    """
    try:
        validated = validate_email(email, check_deliverability=True)
        return validated.normalized
    except EmailNotValidError as e:
        raise ValueError(f"Invalid email: {str(e)}")


def send_otp_email(to_email: str, otp_code: str, purpose: str = "login", client_origin: str = None) -> bool:
    """
    Sends an OTP verification email to the user's real email address.
    1. Attempts dispatch via the HTTPS Vercel email relay (port 443, bypasses Render SMTP port blocks).
    2. Falls back to direct SMTP via SSL (port 465) and STARTTLS (port 587) when running locally or if relay is unavailable.
    Raises ValueError if email is invalid or RuntimeError if delivery fails.
    """
    normalized_email = validate_email_deliverability(to_email)

    title_text = "Two-Step Verification" if purpose == "login" else "Email Verification"
    subject = f"SkillSync AI: {otp_code} is your verification code"

    text_content = (
        f"SkillSync AI {title_text}\n\n"
        f"Your One-Time Password (OTP) is: {otp_code}\n\n"
        f"This code is valid for 10 minutes. Do not share it with anyone."
    )
    html_content = generate_amazon_style_html(otp_code, purpose=purpose, email=normalized_email)

    # Strategy 1: Dispatch via Vercel HTTPS Email Relay over port 443 (Render cloud firewall allows port 443)
    relay_urls = []
    if client_origin and "localhost" not in client_origin and "127.0.0.1" not in client_origin:
        relay_urls.append(f"{client_origin.rstrip('/')}/api/send-email")
    if getattr(settings, "EMAIL_RELAY_URL", None):
        if settings.EMAIL_RELAY_URL not in relay_urls:
            relay_urls.append(settings.EMAIL_RELAY_URL)
    # Default Vercel production deployment URL fallback
    default_relay = "https://skillsync-ai-frontend.vercel.app/api/send-email"
    if default_relay not in relay_urls:
        relay_urls.append(default_relay)

    for relay_url in relay_urls:
        try:
            req_data = json.dumps({
                "to": normalized_email,
                "subject": subject,
                "text": text_content,
                "html": html_content,
                "secret": "skillsync-relay-secret-2026",
            }).encode("utf-8")
            req = urllib.request.Request(
                relay_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "x-relay-secret": "skillsync-relay-secret-2026",
                    "User-Agent": "SkillSync-Backend/1.0",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    logger.info(f"Successfully delivered OTP email to {normalized_email} via HTTPS Relay ({relay_url})")
                    return True
        except Exception as relay_err:
            logger.warning(f"HTTPS email relay via {relay_url} failed: {relay_err}. Trying next option...")

    # Strategy: Brevo HTTP API (Port 443 HTTPS - works seamlessly on cloud providers like Render)
    if getattr(settings, "BREVO_API_KEY", None) and settings.BREVO_API_KEY.strip():
        try:
            brevo_payload = json.dumps({
                "sender": {"name": "SkillSync AI", "email": settings.SMTP_USER or "siddhantrajliwalda@gmail.com"},
                "to": [{"email": normalized_email}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_content,
            }).encode("utf-8")
            brevo_req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=brevo_payload,
                headers={
                    "accept": "application/json",
                    "api-key": settings.BREVO_API_KEY.strip(),
                    "content-type": "application/json",
                },
                method="POST",
            )
            with urllib.request.urlopen(brevo_req, timeout=12) as resp:
                if resp.status in (200, 201):
                    logger.info(f"Successfully delivered OTP email to {normalized_email} via Brevo API")
                    return True
        except Exception as brevo_err:
            logger.warning(f"Brevo API dispatch failed: {brevo_err}")

    # Strategy: Resend HTTP API (Port 443 HTTPS)
    if getattr(settings, "RESEND_API_KEY", None) and settings.RESEND_API_KEY.strip():
        try:
            resend_payload = json.dumps({
                "from": "SkillSync AI <onboarding@resend.dev>",
                "to": [normalized_email],
                "subject": subject,
                "html": html_content,
                "text": text_content,
            }).encode("utf-8")
            resend_req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=resend_payload,
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urllib.request.urlopen(resend_req, timeout=12) as resp:
                if resp.status in (200, 201):
                    logger.info(f"Successfully delivered OTP email to {normalized_email} via Resend API")
                    return True
        except Exception as resend_err:
            logger.warning(f"Resend API dispatch failed: {resend_err}")

    # Direct SMTP (SSL 465, TLS 587) - Works locally and in open networks
    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD):
        raise RuntimeError("SMTP email service is not configured on the server.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL or f"SkillSync AI <{settings.SMTP_USER}>"
    msg["To"] = normalized_email
    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    clean_user = settings.SMTP_USER.strip()
    clean_pass = settings.SMTP_PASSWORD.replace(" ", "").strip()

    ssl_err_info = None
    tls_err_info = None

    # Strategy 2: Connect via SMTP_SSL on port 465
    try:
        with smtplib.SMTP_SSL(settings.SMTP_HOST, 465, timeout=10) as server:
            server.login(clean_user, clean_pass)
            server.sendmail(clean_user, [normalized_email], msg.as_string())
        logger.info(f"Successfully delivered OTP email to {normalized_email} via SMTP_SSL (port 465)")
        return True
    except Exception as ssl_err:
        ssl_err_info = f"{type(ssl_err).__name__}: {ssl_err}"
        logger.warning(f"SMTP_SSL port 465 failed: {ssl_err}. Trying port 587 STARTTLS...")

    # Strategy 3: Connect via SMTP on port 587 with STARTTLS
    try:
        with smtplib.SMTP(settings.SMTP_HOST, 587, timeout=10) as server:
            server.starttls()
            server.login(clean_user, clean_pass)
            server.sendmail(clean_user, [normalized_email], msg.as_string())
        logger.info(f"Successfully delivered OTP email to {normalized_email} via STARTTLS (port 587)")
        return True
    except Exception as tls_err:
        tls_err_info = f"{type(tls_err).__name__}: {tls_err}"
        logger.error(f"Both SMTP ports failed to deliver email to {normalized_email}: {tls_err}")
        raise RuntimeError(
            f"Could not deliver verification email to {normalized_email}. "
            f"Please ensure your email address is correct and can receive mail."
        )
