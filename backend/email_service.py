import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv

load_dotenv()
BREVO_EMAILS_URL = "https://api.brevo.com/v3/smtp/email"
logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    pass


def validate_email_configuration() -> tuple[str, str, str]:
    api_key = os.getenv("BREVO_API_KEY", "").strip()
    sender_email = os.getenv("EMAIL_FROM_EMAIL", "").strip()
    sender_name = os.getenv("EMAIL_FROM_NAME", "AI GRC Platform").strip()

    if not api_key or not sender_email or not sender_name:
        raise RuntimeError(
            "BREVO_API_KEY and EMAIL_FROM_EMAIL are required"
        )

    return api_key, sender_email, sender_name


def send_verification_email(recipient: str, code: str) -> None:
    api_key, sender_email, sender_name = validate_email_configuration()
    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": recipient}],
        "subject": "Verify your email address",
        "textContent": (
            f"Your email verification code is {code}. "
            "It expires in 10 minutes. If you did not request this, "
            "you can ignore this message."
        ),
    }
    request = Request(
        BREVO_EMAILS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=10) as response:
            response_body = response.read()
            status = response.status
    except HTTPError as exc:
        logger.error("Brevo rejected the verification email request (HTTP %s)", exc.code)
        raise EmailDeliveryError(
            f"Brevo rejected the verification email request (HTTP {exc.code})"
        ) from exc
    except (OSError, TimeoutError, URLError) as exc:
        raise EmailDeliveryError("Brevo could not send the verification email") from exc

    try:
        response_data = json.loads(response_body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        response_data = {}

    message_id = response_data.get("messageId")
    if not 200 <= status < 300 or not message_id:
        logger.error("Brevo returned an unexpected response (HTTP %s)", status)
        raise EmailDeliveryError(
            f"Brevo returned an unexpected response (HTTP {status})"
        )
    logger.info("Brevo accepted the verification email (message id: %s)", message_id)
