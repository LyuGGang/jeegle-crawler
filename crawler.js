var Crawler = require("crawler");
var url = require('url');
var sleep = require('sleep');
var amqp = require('amqp');
var request = require('request');

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function recursion() {

    // recursion
    if (i < end) {
        var sleepInterval = randomInt(1, 4);
        console.log("** It will sleep for " + sleepInterval + " second(s).");
        sleep.sleep(sleepInterval);
        var _url = 'http://www.pexels.com/photo/' + ++i + '/';
        console.log("URL: " + _url);
        c.queue(_url);
    } else {

        console.log('** Crawling Ended. Last image number: ' + i);
        console.log('** Crawler Stopped.');
        process.exit(0);
    }
}



var i = 1000;
var end = 1005;
var rabbitMQConn = null;
var q = null;
var req = request.defaults({
    encoding: null
});

var c = new Crawler({

    maxConnections: 100,

    callback: function(error, result, $) {



        if (!!error) {

            console.log(error);

        } else {

            var imageUrl = $('body > div.page-wrap > div > div:nth-child(1) > div > div > a > img').attr('src');
            var tagsTag = $("body > div.page-wrap > div > div:nth-child(3) > div.box.box--tags > ul > li > a > strong"); // <strong></strong>에 담겨있음.

            if (!!imageUrl) {
                // 찾았다!
                // TODO: 큐에 담을 데이터(object)를 정의하고 stringfy해서 buffer(octet-stream)에 담습니다.

                // 태그 처리
                var tags = new Array();
                for (var j = 0; j < tagsTag.length; j++) {

                    tags.push($(tagsTag[j]).text());
                }

                // 이미지 다운 및 base64 변환
                req.get(imageUrl, function(error, response, body) {
                    if (!error && response.statusCode == 200) {

                        var base64Image = new Buffer(body).toString('base64')

                        // 담아서
                        var sendingData = {

                            base64Image: base64Image,
                            imageUrl: imageUrl,
                            tags: tags
                        }

                        // stringify 해서
                        var stringifySendingData = JSON.stringify(sendingData);

                        // queue에 담는다.
                        rabbitMQConn.publish('jeegle', // routing key
                            stringifySendingData, // body
                            null, // option
                            null); // callback
                        console.log("** Image & Tags are successfully Queued.");
                        recursion();
                    }
                });

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
            durable: true, // 서버가 꺼져도 사라지지 않는다!
            autoDelete: false, // 큐를 더 쓰는 사람이 없어도 큐가 사라지지 않는다!
            arguments: {
                "x-max-length-bytes": 1000000000 // MAX: 1000MB
            }
        }, function(queue) {

            console.log('** Queue ' + queue.name + ' is open.');

            // queue.destroy();
            // console.log('** Queue was destroyed.');
            // process.exit(0);

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
