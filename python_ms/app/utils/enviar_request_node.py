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
            timeout=15
        )

        response.raise_for_status()

        if (retornarResponse):
            return response
    except requests.exceptions.RequestException as e:
        mensagem_erro = None
        status_code = None

        # tenta pegar resposta da API
        if hasattr(e, "response") and e.response is not None:
            status_code = e.response.status_code

            try:
                data = e.response.json()
                mensagem_erro = data.get("erro") or data.get("message")
            except ValueError:
                # não veio JSON
                mensagem_erro = e.response.text

        print(f"[API ERROR] {method} {endpoint} -> {status_code} | {mensagem_erro or str(e)}")