import os
import requests
from dotenv import load_dotenv

load_dotenv()

apiNodeURL = os.getenv("api_node_URL")
token_api_node = os.getenv("token_api_node")

def enviar_request(method, endpoint, body=None, params=None, retornarResponse=False):
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
            timeout=180
        )

        response.raise_for_status()

        if (retornarResponse):
            return response
    except requests.exceptions.RequestException as e:
        response = getattr(e, "response", None)

        if response is not None:
            # a API respondeu (400,404,424 etc)
            try:
                data = response.json()
                mensagem_erro = data.get("erro") or data.get("message")
            except ValueError:
                mensagem_erro = response.text

            print(f"[API ERROR] {method} {endpoint} -> {response.status_code} | {mensagem_erro}")

            return response

        else:
            print(f"[NETWORK ERROR] {method} {endpoint} -> {str(e)}")
            return None