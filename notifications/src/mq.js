import amqplib from "amqplib";
const QUEUE = 'auth-notifications';

const connection = await amqplib.connect(process.env.RABBITMQ_URL)

const channel = await connection.createChannel()

channel.assertQueue(QUEUE,{
    durable: true
})

export default channel;