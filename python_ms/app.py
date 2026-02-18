import os
from dotenv import load_dotenv
from app.messaging.consumer import rabbitMQConsumer

load_dotenv()

rabbitHost = os.getenv("rabbitMQ_host")
queueName = os.getenv("queue_name")

if __name__ == "__main__":
    consumer = rabbitMQConsumer(host=rabbitHost, queue_name=queueName)
    consumer.start_consuming()