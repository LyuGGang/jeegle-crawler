var Config = function() {
    // 여기에 환경설정 값을 입력합니다.
    this.rabbitMQServerAddr = "localhost";
    this.mongoAPIAddr = "localhost";
    this.bingTranslatorCredentials = {
        clientId: null,
        clientSecret: null
    };
};

module.exports = Config;
