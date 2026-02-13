import pika
import json
from app.services.consulta_lote_service import consulta_lote_service

class rabbitMQConsumer:
    def __init__(self, host, queue_name):
        self.host = host
        self.queue_name = queue_name
        self.connection = None
        self.channel = None

        print(f"Microserviço em python no ar, escutando a fila '{queue_name}'...")
    
    def on_message(self, channel, method_frame, header_frame, body):
        try:
            bodyJson = json.loads(body.decode("utf-8"))

            id = bodyJson['id']
            id_admin = bodyJson['id_admin']
            id_promotor = bodyJson['id_promotor']
            local_path = bodyJson['local_path']

            # print(local_path)
            consulta_lote = consulta_lote_service(id, id_promotor, local_path)
            consulta_lote.inciar_consulta_lote()
        except json.decoder.JSONDecodeError:
            print("Json Inválido, Interrompendo consulta.")
        except Exception as e:
            print(f"Erro desconhecido: {e}, interrompendo consulta.")
        finally:
            channel.basic_ack(delivery_tag=method_frame.delivery_tag)

    def start_consuming(self):
        # tenta conectar e se der certo, setam as variáveis connection e channel com os valores certos
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host=self.host))
        self.channel = self.connection.channel()

        self.channel.queue_declare(queue=self.queue_name, durable=True)

        self.channel.basic_qos(prefetch_count=1)

        # deixa o consumidor rodando infinitamente (tipo um while True mas do pika)
        self.channel.basic_consume(self.queue_name, on_message_callback=self.on_message)
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            self.channel.stop_consuming()
        
        # depois de sair, fecha a conexão
        self.connection.close()