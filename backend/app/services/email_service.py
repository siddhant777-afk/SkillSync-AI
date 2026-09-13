import logging
import smtplib
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


def send_otp_email(to_email: str, otp_code: str, purpose: str = "login") -> bool:
    """
    Sends an OTP verification email to the user's real email address.
    Connects to Gmail SMTP via SSL (port 465) with TLS (port 587) fallback.
    Raises ValueError if email is invalid or RuntimeError if SMTP delivery fails.
    """
    normalized_email = validate_email_deliverability(to_email)

    title_text = "Two-Step Verification" if purpose == "login" else "Email Verification"
    subject = f"SkillSync AI: {otp_code} is your verification code"

    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD):
        raise RuntimeError("SMTP email service is not configured on the server.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL or f"SkillSync AI <{settings.SMTP_USER}>"
    msg["To"] = normalized_email

    text_content = (
        f"SkillSync AI {title_text}\n\n"
        f"Your One-Time Password (OTP) is: {otp_code}\n\n"
        f"This code is valid for 10 minutes. Do not share it with anyone."
    )
    html_content = generate_amazon_style_html(otp_code, purpose=purpose, email=normalized_email)

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    clean_user = settings.SMTP_USER.strip()
    clean_pass = settings.SMTP_PASSWORD.replace(" ", "").strip()

    ssl_err_info = None
    tls_err_info = None

    # Strategy 1: Connect via SMTP_SSL on port 465 (preferred in cloud environments like Render)
    try:
        with smtplib.SMTP_SSL(settings.SMTP_HOST, 465, timeout=10) as server:
            server.login(clean_user, clean_pass)
            server.sendmail(clean_user, [normalized_email], msg.as_string())
        logger.info(f"Successfully delivered OTP email to {normalized_email} via SMTP_SSL (port 465)")
        return True
    except Exception as ssl_err:
        ssl_err_info = f"{type(ssl_err).__name__}: {ssl_err}"
        logger.warning(f"SMTP_SSL port 465 failed: {ssl_err}. Trying port 587 STARTTLS...")

    # Strategy 2: Connect via SMTP on port 587 with STARTTLS
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
            f"Could not send email to {normalized_email}. "
            f"[Host={settings.SMTP_HOST}, User={settings.SMTP_USER}, "
            f"SSL_err={ssl_err_info}, TLS_err={tls_err_info}]"
        )
