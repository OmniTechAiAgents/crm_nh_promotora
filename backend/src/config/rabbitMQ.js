import amqp from 'amqplib';

let connection = null;
let channel = null;
let connecting = true;

// tempo para tentar reconectar se der merda
const retryTime = 5000;

export async function createConnection() {
    try {
        connecting = true;

        if (channel) return channel;

        connection = await amqp.connect(process.env.RABBITMQ_URL);

        connection.on("close", () => {
            console.error(`❌ Não foi possível se conectar com RabbitMQ, tentando novamente...`);
            channel = null;
            connection = null;
            reconnect();
        });

        connection.on("error", (err) => {
            console.error(`❌ Erro ao se conectar com o rabbitMQ: ${err}`);
        })

        channel = await connection.createChannel();

        console.log("✅ RabbitMQ conectado");
    } catch (err) {
        setTimeout(reconnect, retryTime);
    } finally {
        connecting = false;
    }
}

function reconnect() {
    if (!connecting) {
        connectRabbit();
    }
}

export async function connectRabbit() {
    if (!connection) {
        await createConnection()
    }
}

export async function getChannel() {
    if (channel) return channel

    // cria uma promise para a API tentar se reconectar com o rabbitMQ
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (channel) {
                clearInterval(interval);
                resolve(channel)
            }
        }, 200)
    });
}

