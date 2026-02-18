import os
import requests
from dotenv import load_dotenv

load_dotenv()

apiNodeURL = os.getenv("api_node_URL")
token_api_node = os.getenv("token_api_node")

def enviar_request(method, endpoint, body=None, params=None, retornarBody=False):
    url = f"{apiNodeURL}{endpoint}"

    headers = {
        "apikey": token_api_node
    }

    try:
        response = requests.request(
            method=method.upper(),
            url=url,
            headers=headers,
            json=body,
            params=params,
            timeout=15
        )

        response.raise_for_status()

        if (retornarBody):
            return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[API ERROR] {method} {endpoint} -> {e}")