var Crawler = require("crawler");
var url = require('url');
var sleep = require('sleep');
var amqp = require('amqp');

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var i = 1000;
var end = 1001;
var rabbitMQConn = null;
var q = null;

var c = new Crawler({

    maxConnections: 100,

    callback: function(error, result, $) {

        function recursion() {

            // recursion
            if (i <= end) {
                sleep.sleep(randomInt(1, 3));
                var _url = 'http://www.pexels.com/photo/' + ++i + '/';
                console.log("URL: " + _url);
                c.queue(_url);
            } else {

                console.log('** Crawling Ended. Last image number: ' + i);
                console.log('** Crawler Stopped.');
                process.exit(0);
            }
        }

        if (!!error) {

            console.log(error);

        } else {

            var imageUrl = $('body > div.page-wrap > div > div:nth-child(1) > div > div > a > img').attr('src');
            var tagsTag = $("body > div.page-wrap > div > div:nth-child(3) > div.box.box--tags > ul > li > a > strong"); // <strong></strong>에 담겨있음.

            if (!!imageUrl) {
                // 찾았다!
                console.log(imageUrl);

                // TODO: 큐에 담을 데이터(object)를 정의하고 stringfy해서 buffer(octet-stream)에 담습니다.

                rabbitMQConn.publish('jeegle', // routing key
                    imageUrl, // body
                    null, // option
                    null); // callback
                console.log("** Image & Tags are successfully Queued.");
                recursion();

            } else {
                console.log("** Failed: NO IMAGE");
                recursion();
            }


        }

    }

});


// Start!
console.log("** Crawler Started.");


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
            durable: true,  // 서버가 꺼져도 사라지지 않는다!
            autoDelete: false   // 큐를 더 쓰는 사람이 없어도 큐가 사라지지 않는다!
        }, function(queue) {

            console.log('** Queue ' + queue.name + ' is open.');

            // Crawling Start
            console.log("** Crawling Started.");
            var _url = 'http://www.pexels.com/photo/' + i + '/';
            console.log("URL: " + _url);
            c.queue(_url);
        });


    });


} catch (ex) {
    console.log("** Connecting to RabbitMQ was failed. Because..: " + ex);
    process.exit(code = 1)
}
