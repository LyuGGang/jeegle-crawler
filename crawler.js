var Crawler = require("crawler");
var url = require('url');
var sleep = require('sleep');
// var amqp = require('amqp');
var request = require('request');
var translator = require('bingtranslator');
var im = require('imagemagick');
var fs = require('fs');


var credentials = {
    clientId: 'jeegle-crawler-translator',
    /* Client ID from the registered app */
    clientSecret: 'a/Ypq5yfQGs8E+aIKhWds7eSNCXpF9jUykDMjdmVcHU=' /* Client Secret from the registered app */
};

resizer = function(originalFileName) {



}

// var crawler = function() {

// var self = this;

randomInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

recursion = function() {

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
        // process.exit(0);
    }
}



i = 5250;
end = 7000;
rabbitMQConn = null;
q = null;
req = request.defaults({
    encoding: null
});

processedUrl = new Array();

c = new Crawler({

    maxConnections: 100,

    callback: function(error, result, $) {



        try {

            if (!!error) {

                console.log(error);

            } else {

                var imageUrl = $('body > div.page-wrap > div > div:nth-child(1) > div > div > a').attr('href')
                var thumbnailImageUrl = $('body > div.page-wrap > div > div:nth-child(1) > div > div > a > img').attr('src');
                var tagsTag = $("body > div.page-wrap > div > div:nth-child(3) > div.box.box--tags > ul > li > a > strong"); // <strong></strong>에 담겨있음.

                if (!!imageUrl) {
                    // 찾았다!
                    // 중복인지 아닌지 확인
                    if (processedUrl.indexOf(imageUrl) > -1) {

                        // 중복이다.
                        console.log("** Duplicated " + i);
                        recursion();


                    } else {

                        // 처음이다.
                        processedUrl.push(imageUrl);


                        // 파일 처리
                        // 파일 다운로드
                        var fileNameFromUrl = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

                        var ws = fs.createWriteStream('images/' + fileNameFromUrl);

                        ws.on('close', function() {

                            console.log('stream closed...');

                            var originalFileName = 'images/' + fileNameFromUrl;

                            // resize (짧은축이 640이 되도록)
                            im.identify(['-format', '%w:%h', originalFileName], function(err, originalSize) {

                                try {
                                    if (err) throw err;
                                    console.log(originalSize);
                                    originalSize = originalSize.split(':');
                                    dstFileName = originalFileName.split('.')[0] + "-640." + originalFileName.split('.')[1];
                                    var option = {
                                        srcPath: originalFileName,
                                        dstPath: 'resized/' + dstFileName
                                    };
                                    if (originalSize[0] >= originalSize[1]) {

                                        // width가 더 길다 -> height에 맞춰야함
                                        option.height = 640;
                                    } else {
                                        option.width = 640;
                                    }


                                    im.resize(option, function(err, stdout, stderr) {

                                        try {
                                            if (err) throw err;
                                            console.log('resized success');

                                            // 파일명 겟
                                            var imagePath = option.dstPath.replace(/^.*[\\\/]/, '');

                                            // 태그 처리
                                            var tags = new Array();
                                            var tempArray = new Array();

                                            for (var j = 0; j < tagsTag.length; j++) {


                                                var word = $(tagsTag[j]).text();

                                                tags.push({
                                                    word: word,
                                                    score: 1
                                                });

                                                tempArray.push(word);

                                            }



                                            //한글 번역 넣기
                                            translator.translateArray(credentials, tempArray, 'en', 'ko', function(err, translated) {

                                                if (err) {
                                                    console.log("Error on translating: ", err);
                                                } else {

                                                    // 배열에 push
                                                    for (var j = 0; j < translated.length; j++) {

                                                        tags.push({
                                                            word: translated[j].TranslatedText,
                                                            score: 1
                                                        });
                                                    }
                                                    // 담아서
                                                    var sendingData = {

                                                        // base64Image: base64Image,
                                                        imagePath: imagePath,
                                                        imageUrl: imageUrl,
                                                        thumbnailImageUrl: thumbnailImageUrl,
                                                        tags: tags
                                                    }

                                                    // stringify 해서
                                                    var stringifySendingData = JSON.stringify(sendingData);

                                                    // // queue에 담는다.
                                                    // rabbitMQConn.publish('jeegle', // routing key
                                                    //     stringifySendingData, // body
                                                    //     null, // option
                                                    //     null); // callback

                                                    console.log(stringifySendingData);

                                                    // 파일로 쓴다. (append)
                                                    fs.writeFile('output.json', stringifySendingData + ",", {
                                                        flag: 'a+'
                                                    }, function(err) {

                                                        if (err) throw err;

                                                        console.log("** Image & Tags are successfully downloaded and written to json.");
                                                        fs.unlinkSync(originalFileName);
                                                        recursion();
                                                    })



                                                }
                                            });
                                        } catch (ex) {

                                            console.log("***********EXCEPTION!!: " + i + " - " + ex);
                                            recursion();
                                        }



                                    });
                                } catch (ex) {

                                    console.log("***********EXCEPTION!!: " + i + " - " + ex);
                                    recursion();
                                }

                            });


                        });

                        request(imageUrl).pipe(ws);
                    }




                } else {
                    console.log("** Failed: NO IMAGE");
                    recursion();
                }


            }
        } catch (ex) {

            console.log("***********EXCEPTION!!: " + i + " - " + ex);
            recursion();
        }

    }

});


// this.start = function(rabbitMQServerAddr) {

// Crawling Start
console.log("** Crawling Started.");
var _url = 'http://www.pexels.com/photo/' + i + '/';
console.log("URL: " + _url);
c.queue(_url);

// var self = this;
//
// self.rabbitMQServerAddr = rabbitMQServerAddr;
//
// // Start!
// console.log("** Crawler Started.");
//
//
// // RabbitMQ Connection
// try {
//
//     console.log("** Trying to connect RabbitMQ...");
//     rabbitMQConn = amqp.createConnection({
//         host: 'localhost'
//     });
//
//     rabbitMQConn.on('ready', function() {
//
//         console.log("** RabbitMQ was successfully Connected.");
//
//         // queue declaring
//         q = rabbitMQConn.queue('jeegle', {
//             durable: true, // 서버가 꺼져도 사라지지 않는다!
//             autoDelete: false, // 큐를 더 쓰는 사람이 없어도 큐가 사라지지 않는다!
//             arguments: {
//                 "x-max-length-bytes": 1000000000 // MAX: 1000MB
//             }
//         }, function(queue) {
//
//             console.log('** Queue ' + queue.name + ' is open.');
//
//             // queue.destroy();
//             // console.log('** Queue was destroyed.');
//             // process.exit(0);
//
//             // Crawling Start
//             console.log("** Crawling Started.");
//             var _url = 'http://www.pexels.com/photo/' + i + '/';
//             console.log("URL: " + _url);
//             c.queue(_url);
//         });
//
//
//     });
//
//
// } catch (ex) {
//     console.log("** Connecting to RabbitMQ was failed. Because..: " + ex);
//     process.exit(code = 1)
// }
//
//
// }

// }
//
// var ccc = new crawler();
// ccc.start(null);
