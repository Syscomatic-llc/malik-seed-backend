"""Email service for sending notifications"""
import os
from typing import List, Optional


class EmailService:
    """Simple email service - configure with SMTP or use console output for dev"""

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@malikseed.com")
        self.console_mode = not self.smtp_host  # Use console if no SMTP configured

    def send_email(self, to_addresses: List[str], subject: str, body: str, body_html: Optional[str] = None):
        """Send email via SMTP or log to console"""
        if self.console_mode:
            print(f"\n{'='*60}")
            print(f"EMAIL (Console Mode)")
            print(f"{'='*60}")
            print(f"To: {', '.join(to_addresses)}")
            print(f"Subject: {subject}")
            print(f"{'-'*60}")
            print(body)
            print(f"{'='*60}\n")
            return True

        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = ', '.join(to_addresses)

            msg.attach(MIMEText(body, 'plain'))
            if body_html:
                msg.attach(MIMEText(body_html, 'html'))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_addresses, msg.as_string())
            return True
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False

    def send_job_application_notification(self, application_data: dict):
        """Send job application notification to admin"""
        subject = f"New Job Application: {application_data.get('first_name', '')} {application_data.get('last_name', '')}"
        body = f"""
New job application received:

Name: {application_data.get('first_name', '')} {application_data.get('last_name', '')}
Email: {application_data.get('email', '')}
Phone: {application_data.get('phone', 'N/A')}
Position: {application_data.get('position', 'N/A')}
Experience: {application_data.get('experience_years', 'N/A')} years

Please review in the admin panel.
"""
        admin_email = os.getenv("ADMIN_EMAIL", "admin@malikseed.com")
        self.send_email([admin_email], subject, body)


# Singleton instance
email_service = EmailService()
