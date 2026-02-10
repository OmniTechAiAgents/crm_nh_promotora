import pika
import time
import json

print("fodase teste")

while True:
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host="rabbitmq")
        )
        channel = connection.channel()

        channel.queue_declare(queue="fila_teste", durable=True)

        def callback(ch, method, properties, body):
            data = json.loads(body.decode("utf-8"))
            print("Recebido:", body)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_consume(
            queue="fila_teste",
            on_message_callback=callback
        )

        print("Aguardando mensagens...")
        channel.start_consuming()

    except pika.exceptions.AMQPConnectionError as e:
        print("Conexão perdida, tentando reconectar em 5s...", e)
        time.sleep(5)
