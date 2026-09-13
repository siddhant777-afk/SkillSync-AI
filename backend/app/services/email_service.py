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


def send_otp_email(to_email: str, otp_code: str, purpose: str = "login") -> dict:
    """
    Sends an OTP verification email to the user's real email address.
    Attempts real email dispatch via SMTP. If SMTP is not configured or fails
    (e.g. cloud provider blocks outbound port 587), logs the OTP and returns
    delivered=False with fallback details so the application never crashes.
    """
    try:
        normalized_email = validate_email_deliverability(to_email)
    except Exception:
        normalized_email = to_email.strip().lower()

    title_text = "Two-Step Verification" if purpose == "login" else "Email Verification"
    subject = f"SkillSync AI: {otp_code} is your verification code"

    # Check if SMTP configuration is present
    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD):
        banner = f"""
================================================================================
[SkillSync AI Email Service - DEV / FALLBACK MODE]
To:        {normalized_email}
OTP Code:  {otp_code}
Purpose:   {title_text}
Note:      SMTP credentials not configured on host. Returning code directly.
================================================================================
"""
        logger.info(banner)
        print(banner)
        return {
            "delivered": False,
            "reason": "SMTP credentials not configured on host.",
            "fallback_code": otp_code,
        }

    # Dispatch real email via SMTP
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"SkillSync <{settings.SMTP_USER}>"
        msg["To"] = normalized_email

        text_content = (
            f"SkillSync AI {title_text}\n\n"
            f"Your One-Time Password (OTP) is: {otp_code}\n\n"
            f"This code is valid for 1 minute only. Do not share it with anyone."
        )
        html_content = generate_amazon_style_html(otp_code, purpose=purpose, email=normalized_email)

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=8) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER.strip(), settings.SMTP_PASSWORD.replace(" ", "").strip())
            server.sendmail(settings.SMTP_USER.strip(), [normalized_email], msg.as_string())

        logger.info(f"Successfully delivered OTP email to {normalized_email}")
        return {"delivered": True, "fallback_code": None}
    except Exception as e:
        logger.warning(f"SMTP delivery failed to {normalized_email}: {e}. Falling back to direct code verification.")
        return {
            "delivered": False,
            "reason": f"SMTP delivery could not complete: {str(e)}",
            "fallback_code": otp_code,
        }
