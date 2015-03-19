var amqp = require('amqp');
var i = 0;

// Start!
console.log('** Image Processor Started.');

// RabbitMQ Connection
try {

    console.log("** Trying to connect RabbitMQ...");
    rabbitMQConn = amqp.createConnection({
        host: 'tehranslippers.com'
    });

    rabbitMQConn.on('ready', function() {

        console.log("** RabbitMQ was successfully Connected.");

        // queue declaring
        q = rabbitMQConn.queue('jeegle', {
            durable: true,
            autoDelete: false
        }, function(queue) {

            console.log('** Queue ' + queue.name + ' is open.');

            // TODO: Get object from queue

            // 역직렬화


            // Catch all messages
            // queue.bind('#');

            // Receive messages

            queue.subscribe({
                ack: true, // auto ack. disabled
                prefetchCount: 1 // 한번에 하나씩..
            }, function(message, header, deliveryInfo, ack) {


                ack.acknowledge(false); // true 주면 이전꺼 다 ack 줌.

                // Print messages to stdout
                console.log(message);
            });

        });


    });


} catch (ex) {
    console.log("** Connecting to RabbitMQ was failed. Because..: " + ex);
    process.exit(code = 1)
}
