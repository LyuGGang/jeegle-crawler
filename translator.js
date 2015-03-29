var translator = require('bingtranslator');
var request = require('request');

var credentials = {
    clientId: '',
    /* Client ID from the registered app */
    clientSecret: '' /* Client Secret from the registered app */
};


var recursion = function(index) {

    console.log('** Translate #' + index + " id: " + imagesObj.data[index]._id);

    // 임시 배열 만들어서 영어 tag 담기
    var tempArray = imagesObj.data[index].tags;

    // 먼저 한글 부분 영어로 번역해서 임시 배열에 push 하기
    translator.translateArray(credentials, imagesObj.data[index].tags, 'en', 'ko', function(err, translated) {

        if (err) {
            console.log("Error on translating: ", err);
        } else {

            // 배열에 push
            for (var j = 0; j < translated.length; j++) {

                tempArray.push(translated[j].TranslatedText);
            }

            // 자 이제 영어, 한글 tag array가 완성되었다.
            // name, score 구조로 임시배열2 만들기
            var scoredArray = new Array();

            for (var k = 0; k < tempArray.length; k++) {

                scoredArray.push({
                    'word': tempArray[k],
                    'score': 0
                });
            }


            // 서버로 put request 보내기
            // console.log(scoredArray);
            console.log('** Sending PUT Req. #' + index + "...");
            request.put({
                url: 'http://localhost/api/images/' + imagesObj.data[index]._id,
                headers: {
                    'Content-Type': 'application/json'
                },
                json: {
                    tags: scoredArray
                }
            }, function(err, httpResponse, body) {
                if (!!err) {


                    console.log('** Data #' + index + ' was translating & storing failed. because..: ' + err);
                } else {


                    console.log('** Data #' + index + ' was successfully translated & stored.');

                }

                recursion(++index);
            })

        }
    });
}



// START!
console.log('** Translator started..');
// GET
var readStream = '';
var imagesObj = null;

console.log('** Retrieving images data from DB..');

request
    .get('http://localhost/api/images/')
    .on('data', function(chunk) {

        readStream += chunk;
    })
    .on('end', function() {

        console.log('** Retrieving was successfully done.');

        imagesObj = JSON.parse(readStream);
        // console.log(imagesObj.data.length);


        // for (var i = 0; i < imagesObj.data.length; i++) {
        // for (var i = 0; i < 10; i++) {

        var _index = 0;
        recursion(_index);
        // }

    });
