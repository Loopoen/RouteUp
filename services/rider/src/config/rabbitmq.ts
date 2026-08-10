import amqplib from "amqplib"

let channel:amqplib.Channel

export const connectRabbitMQ = async()=>{
    const connection = await amqplib.connect(process.env.RABBITMQ_URL!)

    channel = await connection.createChannel()



    await channel.assertQueue(process.env.RIDER_QUEUE!,
        {durable:true}
    )

       await channel.assertQueue(process.env.ORDER_READY_QUEUE!,
        {durable:true}
    )

    console.log("connect rabbitmq thanh cong")


}

export const getChannel = () =>channel