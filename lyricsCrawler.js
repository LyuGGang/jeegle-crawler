/**
 * Created by LyuGGang on 15. 5. 4..
 */

// require
var Crawler = require("crawler");
var url = require('url');
var request = require('request');
var mysql = require('mysql');
var async = require('async');

// settings
var connection = mysql.createConnection({

    host: 'tehranslippers.com',
    user: 'root',
    password: 'xpgpfks!@',
    database: 'curie_finish'
});

// start
connection.connect();

// max: 5757612
var i = 213; // e.g. 아이유 분홍신: 855462 , 샤이니 누난너무예뻐 802382
var max = 5757612;

var recursion = function () {

    if (i > max) {

        connection.end();
        console.log("** Crawling Finished!! " + i);
        process.exit(code = 0);
    }

    console.log("# " + i);

    // ret. db data
    connection.query('SELECT id, title, artist FROM curie_finish.song_info WHERE id = ' + i, function (err, rows, fields) {

        if (!!err) console.log(err);

        // get lyrics data
        var lyricsCrawler = new Crawler({
            maxConnections: 5,
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36",
            callback: function (err, result, $) {

                var lyrics = $("#contents_area > table > tr:nth-child(3) > td:nth-child(1)").text().replace('Tweet', '').replace('{lang: \'ko\'}', '').replace("\t", '').trim(); //.replace(/(?:\r\n|\r|\n)/g, ' ')

                // get melon popular point
                var melonCrawler = new Crawler({
                    maxConnections: 5,
                    //userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36",
                    userAgent: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.3; WOW64; Trident/7.0)",
                    callback: function (err, result, $) {


                        //console.log($("body").html());
                        //console.log();
                        if (!!err) console.log(err);

                        //var point = Number($(".tb_list.d_song_list.songTypeOne > table > tr:nth-child(1) > td:nth-child(6) > div > button > span.cnt").text().replace("총건수", '').trim().replace(",", ""));
                        var point = Number($("#d_like_count").text().replace(",", ""));

                        // 가사와 포인트 모두 가졌다.
                        // DB에 업데이트
                        //console.log(lyrics);
                        //console.log(point);
                        console.log("Getting Points..............[  OK  ]");
                        console.log("Getting Lyrics..............[  OK  ]");

                        var escapedLyrics = lyrics.replace(/'/g, "\\'");
                        var updateQuery = 'UPDATE curie_finish.song_info SET lyrics = \'' + escapedLyrics + '\', popular = ' + point + ' WHERE id = ' + i;
                        //console.log(updateQuery);
                        connection.query(updateQuery, function (__err, __rows, __fiedls) {

                            if (!!__err) console.log(__err);

                            console.log("# " + i + ": UPDATING TO DB SUCCESS!!");
                            i++; recursion();
                            //connection.end();
                        });


                    }
                });

                //var __url = "https://www.melon.com/search/total/index.htm?q=" + encodeURIComponent(rows[0].artist + rows[0].title) + "&section=&searchGnbYn=Y&ipath=srch_form";
                //var __url = "http://www.melon.com/search/song/?q="


                // DB에서 melon song key값을 가져온다.
                connection.query('SELECT link_id FROM curie_finish.link_ids WHERE app_id = 3 AND song_id=' + i, function (_err, _rows, _fields) {

                    if (_rows.length > 0) {

                        // 있으면?
                        var __url = "https://www.melon.com/song/detail.htm?songId=" + _rows[0].link_id;
                        console.log(__url);
                        melonCrawler.queue({uri: __url, forceUTF8: false, followRedirect: false, maxRedirects: 1});
                        //connection.end();

                    } else {

                        // 없으면 그냥 넘어감.
                        // 가사만이라도 DB에 업데이트

                        //console.log(lyrics);
                        console.log("Points..............[Failed]");
                        console.log("Lyrics..............[  OK  ]");
                        //connection.end();

                        var escapedLyrics = lyrics.replace(/'/g, "\\'");
                        var updateQuery = 'UPDATE curie_finish.song_info SET lyrics = \'' + escapedLyrics + '\', popular = 0 WHERE id = ' + i;
                        //console.log(updateQuery);
                        connection.query(updateQuery, function (__err, __rows, __fiedls) {

                            if (!!__err) console.log(__err);

                            console.log("# " + i + ": UPDATING TO DB SUCCESS!!");
                            i++; recursion();
                            //connection.end();

                        });


                    }

                });
            }
        })

        if(rows.length > 0) {
            console.log(rows[0].artist, rows[0].title);
            var _url = "http://www.gasazip.com/view.html?singer2=" + encodeURIComponent(rows[0].artist) + "&title2=" + encodeURIComponent(rows[0].title) + "&Submit=" + encodeURIComponent("검색");
            console.log(_url);
            lyricsCrawler.queue(_url);
        } else {
            console.log("#" + i + ": NO DATA IN MARIA DB!");
            i++; recursion();
        }

    });

};

// start!
recursion();