var Crawler = require("crawler");
var url = require('url');
var sleep = require('sleep');
var amqp = require('amqp');

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var i = 1000;
var end = 1001;
var rabbitMQConn = null;

var c = new Crawler({

    maxConnections: 100,

    callback: function (error, result, $) {

        if (!!error){

            console.log(error);

        } else {

            var imageUrl = $('body > div.page-wrap > div > div:nth-child(1) > div > div > a > img').attr('src');
            var tagsTag = $("body > div.page-wrap > div > div:nth-child(3) > div.box.box--tags > ul > li > a > strong"); // <strong></strong>에 담겨있음.

            if(!!imageUrl) {
                // 찾았다!
                console.log(imageUrl);
                console.log("** Image & Tags are successfully Queued.");
            } else {
                console.log("** Failed: NO IMAGE");
            }

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

    }

});


// Start!
console.log("** Crawler Started.");


// RabbitMQ Connection
try{

    rabbitMQConn = amqp.createConnection({host: 'tehranslippers.com'});

    rabbitMQConn.on('ready', function(){

        console.log("** RabbitMQ was successfully Connected.");

        // Crawling Start
        console.log("** Crawling Started.");
        var _url = 'http://www.pexels.com/photo/' + i + '/';
        console.log("URL: " + _url);
        c.queue(_url);
    });


} catch(ex) {
    console.log("** Connecting to RabbitMQ was failed. Because..: " + ex);
    process.exit(code=1)
}
