
import os
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("BREVO_API_KEY", "").strip()

request = Request(
    "https://api.brevo.com/v3/account",
    headers={
        "accept": "application/json",
        "api-key": api_key
    },
    method="GET"
)

try:
    with urlopen(request, timeout=10) as response:
        print("Brevo authentication successful!")
        print("HTTP Status:", response.status)

except HTTPError as error:
    print("Brevo authentication failed!")
    print("HTTP Status:", error.code)
    print(error.read().decode("utf-8"))

except Exception as error:
    print("Connection error:", error)
