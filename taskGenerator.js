var readline = require('readline');
var amqp = require('amqp');

var TaskGenerator = function() {

    this.taskParams = {
        url: null,
        imageCSSSelector: null,
        thumbnailCSSSelector: null,
        tagsCSSSelector: null,
        startNum: null,
        endNum: null
    };

    this.tasks = new Array();

    this.start = function(rabbitMQServerAddr) {

        var self = this;
        self.rabbitMQServerAddr = rabbitMQServerAddr;

        //http://www.pexels.com/photo/{i}/
        // string format
        // http://stackoverflow.com/questions/18405736/is-there-a-c-sharp-string-format-equivalent-in-javascript
        if (!String.prototype.format) {
            String.prototype.format = function() {
                var args = arguments;
                return this.replace(/{[i]}/g, function(match, number) {
                    return typeof args[0] != 'undefined' ? args[0] : match;
                });
            };
        }

        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('** Welcome to Jeegle Crawler / Task Generator **');
        console.log('');

        console.log('- Type the URL to crawling with a number field \'{i}\'');
        console.log('e.g.) http://www.pexels.com/photo/{i}/');
        rl.question('> ', function(answer) {

            self.taskParams.url = answer;

            console.log("");
            console.log("- Type the jQuery CSS selector of image path");
            console.log("e.g.) $('body > div.page-wrap > div > div:nth-child(1) > div > div > a').attr('href')");
            rl.question('> ', function(answer) {

                self.taskParams.imageCSSSelector = answer;

                console.log("");
                console.log("- Type the jQuery CSS selector of thumbnail image path");
                console.log("e.g.) $('body > div.page-wrap > div > div:nth-child(1) > div > div > a > img').attr('src')");
                rl.question('> ', function(answer) {

                    self.taskParams.thumbnailCSSSelector = answer;

                    console.log("");
                    console.log("- Type the jQuery CSS selector of tags array");
                    console.log("e.g.) $('body > div.page-wrap > div > div:nth-child(3) > div.box.box--tags > ul > li > a > strong')");
                    rl.question('> ', function(answer) {

                        self.taskParams.tagsCSSSelector = answer;

                        console.log("");
                        console.log("- Type the number of starting point");
                        console.log("e.g.) 1000");
                        rl.question('> ', function(answer) {

                            self.taskParams.startNum = Number(answer);

                            console.log("");
                            console.log("- Type the number of ending point");
                            console.log("e.g.) 9999");
                            rl.question('> ', function(answer) {

                                self.taskParams.endNum = Number(answer);


                                // end of input
                                console.log('** Gererating the task samples...');

                                // make task list
                                for (var i = self.taskParams.startNum; i <= self.taskParams.endNum; i++) {

                                    var _url = self.taskParams.url.format(i.toString());

                                    self.tasks.push({
                                        url: _url,
                                        imageCSSSelector: self.taskParams.imageCSSSelector,
                                        thumbnailCSSSelector: self.taskParams.thumbnailCSSSelector,
                                        tagsCSSSelector: self.taskParams.tagsCSSSelector
                                    });

                                }


                                console.log("** Example of task that you request. (" + self.taskParams.startNum + "~" + self.taskParams.endNum + ")");
                                console.dir(self.tasks[0]);
                                console.log("** Is that right? [Y/n]");

                                rl.question('> ', function(answer) {

                                    if (answer.toLowerCase() == 'y') {

                                        console.log("** Queue to RabbitMQ Server \'" + self.rabbitMQServerAddr + "\'...");

                                        var rabbitMQConn = null;

                                        // connect to queue
                                        console.log("** Trying to connect RabbitMQ...");
                                        rabbitMQConn = amqp.createConnection({
                                            host: self.rabbitMQServerAddr
                                        });

                                        rabbitMQConn.on('ready', function() {

                                            console.log("** RabbitMQ was successfully Connected.");

                                            // queue declaring
                                            q = rabbitMQConn.queue('jeegle-task', {
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
                                                console.log("** Queuing Started.");

                                                // Queue!
                                                self.tasks.forEach(function(el, index, array) {

                                                    var stringifyData = JSON.stringify(el);

                                                    // queue에 담는다.
                                                    rabbitMQConn.publish('jeegle-task', // routing key
                                                        stringifyData, // body
                                                        null, // option
                                                        null); // callback
                                                    console.log("** #" + index + " task was successfully Queued.");

                                                    if(index >= array.length - 1) {

                                                        console.log("** All tasks were successfully Queued. If you didn't start crawler yet, just command '$node jc.js c' to run the crawler.");
                                                        console.log("** Bye!");
                                                        process.exit(0);
                                                    }
                                                });
                                            });
                                        });

                                    } else {
                                        console.log("** Bye!");
                                        process.exit(0);
                                    }
                                });

                            });
                        });
                    });

                });

            });

        });

    };



};

module.exports = TaskGenerator;
