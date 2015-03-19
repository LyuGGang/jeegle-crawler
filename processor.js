var amqp = require('amqp');

// Start!
console.log('** Image Processor Started.');

// RabbitMQ Connection
try{

    console.log("** Trying to connect RabbitMQ...");
    rabbitMQConn = amqp.createConnection({host: 'tehranslippers.com'});

    rabbitMQConn.on('ready', function(){

        console.log("** RabbitMQ was successfully Connected.");

        // queue declaring
        q = rabbitMQConn.queue('jeegle', function (queue) {

          console.log('** Queue ' + queue.name + ' is open.');

          // TODO: Get object from queue

        });


    });


} catch(ex) {
    console.log("** Connecting to RabbitMQ was failed. Because..: " + ex);
    process.exit(code=1)
}
