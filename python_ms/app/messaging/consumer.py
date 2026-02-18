import pika
import json
from app.services.consulta_lote_service import consulta_lote_service

class rabbitMQConsumer:
    def __init__(self, host, queue_name):
        self.host = host
        self.queue_name = queue_name
        self.connection = None
        self.channel = None
    
    def on_message(self, channel, method_frame, header_frame, body):
        try:
            bodyJson = json.loads(body.decode("utf-8"))

            id = bodyJson['id']
            id_admin = bodyJson['id_admin']
            id_promotor = bodyJson['id_promotor']
            local_path = bodyJson['local_path']
            instituicao = bodyJson['instituicao']

            # print(local_path)
            consulta_lote = consulta_lote_service(id, id_promotor, local_path, instituicao)
            consulta_lote.inciar_consulta_lote()
        except json.decoder.JSONDecodeError:
            print("Json Inválido, Interrompendo consulta.")
        except Exception as e:
            print(f"Erro desconhecido: {e}, interrompendo consulta.")
        finally:
            try:
                if channel.is_open:
                    channel.basic_ack(delivery_tag=method_frame.delivery_tag)
            except Exception as ack_error:
                print("Falha ao dar ACK (provável reconexão):", ack_error)

    def start_consuming(self):
        while True:
            try:
                # tenta conectar e se der certo, setam as variáveis connection e channel com os valores certos
                params = pika.ConnectionParameters(
                    host=self.host,
                    heartbeat=600,
                    blocked_connection_timeout=300
                )

                self.connection = pika.BlockingConnection(params)
                self.channel = self.connection.channel()

                self.channel.queue_declare(queue=self.queue_name, durable=True)

                self.channel.basic_qos(prefetch_count=1)

                # deixa o consumidor rodando infinitamente (tipo um while True mas do pika)
                self.channel.basic_consume(self.queue_name, on_message_callback=self.on_message)

                print(f"Microserviço em python no ar, escutando a fila '{self.queue_name}'...")
                self.channel.start_consuming()
            except Exception as e:
                print("Conexão perdida com RabbitMQ. Reconectando em 5s...", e)
                import time
                time.sleep(5)