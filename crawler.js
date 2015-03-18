var Crawler = require("crawler");
var url = require('url');
var sleep = require('sleep');

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var i = 1000;

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
            } else {
                console.log("NO IMAGE");
            }

            // recursion
            sleep.sleep(randomInt(1, 3));
            var _url = 'http://www.pexels.com/photo/' + ++i + '/';
            console.log(_url);
            c.queue(_url);
        }

    }

});


// start!

var _url = 'http://www.pexels.com/photo/' + i + '/';
console.log(_url);
c.queue(_url);
