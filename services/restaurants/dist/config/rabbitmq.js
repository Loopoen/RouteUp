import amqplib from "amqplib";
let channel;
export const connectRabbitMQ = async () => {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(process.env.PAYMENT_QUEUE, {
        durable: true,
    });
    console.log("connect rabbitmq thanh cong");
};
export const getChannel = () => channel;
