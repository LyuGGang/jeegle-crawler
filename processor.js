var amqp = require('amqp');
var request = require('request');

var i = 0;
var req = request.defaults({
    encoding: null
});

// Start!
console.log('** Image Processor Started.');

// RabbitMQ Connection
try {

    console.log("** Trying to connect RabbitMQ...");
    rabbitMQConn = amqp.createConnection({
        host: 'localhost'
    });

    rabbitMQConn.on('ready', function() {

        console.log("** RabbitMQ was successfully Connected.");

        // queue declaring
        q = rabbitMQConn.queue('jeegle', {
            durable: true,
            autoDelete: false,
            arguments: {
                "x-max-length-bytes": 1000000000 // MAX: 1000MB
            }
        }, function(queue) {

            console.log('** Queue ' + queue.name + ' is open.');
            console.log('** Now on Receiving...');

            // Catch all messages
            // queue.bind('#');

            // Receive messages

            queue.subscribe({
                ack: true, // auto ack. disabled
                prefetchCount: 1 // 한번에 하나씩..
            }, function(message, header, deliveryInfo, ack) {


                console.log('** Data Recevied!');
                // TODO: Get object from queue

                // 역직렬화
                var recvObj = JSON.parse(message.data.toString());

                // console.log(recvObj.imageUrl); // for debug
                // console.log(recvObj.base64Image); // for debug

                console.log("** URL: " + recvObj.imageUrl);

                // // 이미지 프로세싱
                //
                // console.log('** Image was trasnformed.');

                // 태그 한글번역(영어도 그대로 보관할것)

                // console.log('** Tags were translated.');

                // console.log(recvObj.tags);

                // 실제 DB에 입력
    

                // 이미지 다운 및 base64 변환
                request.post({
                    url: 'http://localhost/api/images/',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    json: {
                        originalImageUrl: recvObj.imageUrl,
                        thumbnailImageUrl: recvObj.thumbnailImageUrl,
                        tags: recvObj.tags
                    }
                }, function(err, httpResponse, body) {
                    if (!!err) {


                        // console.log(httpResponse, err);
                    } else {

                        // console.log(httpResponse.status);
                        console.log('** Data was successfully processed & stored. Ack will be sent.');
                        ack.acknowledge(false); // true 주면 이전꺼 다 ack 줌.
                    }
                })




            });

        });


    });


} catch (ex) {
    console.log("** Connecting to RabbitMQ was failed. Because..: " + ex);
    process.exit(code = 1)
}
