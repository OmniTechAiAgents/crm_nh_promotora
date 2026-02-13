import { getChannel } from "../config/rabbitMQ.js";
import HttpException from "./HttpException.js";

export async function PublisherRabbitMQ(queue, message) {
    const channel = await getChannel();
    
    if (!channel) {
        throw new HttpException("Serviço temporariamente indisponível", 503);
    }

    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
    );
}