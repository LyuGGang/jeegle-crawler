// Jeegle Crawler Commander
// get configuration
var Config = require('./config');
var config = new Config();

var TaskGenerator = require('./taskGenerator');
var taskGenerator = new TaskGenerator();

var Crawler = require('./crawler');
var crawler = new Crawler();

var printUsage = function () {

    console.log("** Jeegle Crawler Commander **");
    console.log("");
    console.log("- Structure");
    console.log("Task Generator -> RabbitMQ(jeegle-task) -> Crawler(crawling images & tags) -> RabbitMQ(jeegle) -> Processor(trnaslating tags & publishing to server)");
    console.log("");
    console.log("- Usage");
    console.log("$ node jc.js [command]");
    console.log("");
    console.log("- Command List");
    console.log("g: Generate task and queue to RabbitMQ");
    console.log("c: Run the Crawler");
    console.log("p: Run the Processor");
    console.log("q: Show RabbitMQ status");
    console.log("help: Show this usage");

}

// validation config
if (!config.rabbitMQServerAddr || !config.mongoAPIAddr || !config.bingTranslatorCredentials) {

    console.log('** You have to set config.js first!');
    process.exit(1);
}

// get argv
var param = process.argv[2];

if (!!param) {

    switch(param.toLowerCase()){

        case "g":
            taskGenerator.start(config.rabbitMQServerAddr);
            break;
        case "c":
            crawler.start(config.rabbitMQServerAddr);
            break;
        case "p":
            break;
        case "q":
            break;
        case "help":
        default:
            printUsage();
            break;
    }

} else {

    printUsage();
}
