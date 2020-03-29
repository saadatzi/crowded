/**
 * Module dependencies
 */
require('dotenv').config();
var os = require('os');
const express = require('express');
const app = express();
// const proxy = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');
// const mongoose = require('mongoose');
const config = require('config');
const serverConfig = config.get('serverConfig');

const helmet = require('helmet');

const logger = require('./utils/winstonLogger');

const {verifyToken} = require('./utils/jwt');
// const CheckException = require('./utils/CheckException');
logger.info('^^^^^^^^^^^  .ENV DBNAME: %s', process.env.MONGO_DATABASE);


/*
* db Mongoose connection
* */
const db = require('./db');
db.connectMongoose();

/*
* Helmet helps you secure your Express apps by setting various HTTP headers. It’s not a silver bullet, but it can help!
* */
app.use(helmet());


/*
* Handle corsOrigin
* */
/*const corsOptions = {
    origin: '*',
};
app.use(cors(corsOptions));*/
/*app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});*/


/*
* Authentication JWT
* */
app.use(verifyToken);


/*
* start Routing
* */
app.use('/', require('./routing'))

// start server
const port = process.env.NODE_ENV === 'production' ? serverConfig.productPort : serverConfig.port;

var server = app.listen(port, function () {
    logger.info('********* Server is running on Port: %s', port);
});
server.setTimeout(10 * 60 * 1000);


// server Crash Handle
process.on('unhandledRejection', (reason, promise) => {
    logger.error('!!!!! SERVER unhandledRejection at:', reason.stack || reason || promise);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
process.on('uncaughtException', function (err) {
    logger.error('!!!!! SERVER uncaughtException err:', err);
});

if (process.env.NODE_APP_INSTANCE === '0') {
    require('./singleRun');

    /*logo Start App*/
    logger.info("\n__/\\\\\\\\\\_____/\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\________/\\\\\\_\n" +
        " _\\/\\\\\\\\\\\\___\\/\\\\\\_\\/////\\\\\\///__\\////////////\\\\\\__\\/\\\\\\///////////__\\/\\\\\\_____/\\\\\\//__\n" +
        "  _\\/\\\\\\/\\\\\\__\\/\\\\\\_____\\/\\\\\\_______________/\\\\\\/___\\/\\\\\\_____________\\/\\\\\\__/\\\\\\//_____\n" +
        "   _\\/\\\\\\//\\\\\\_\\/\\\\\\_____\\/\\\\\\_____________/\\\\\\/_____\\/\\\\\\\\\\\\\\\\\\\\\\_____\\/\\\\\\\\\\\\//\\\\\\_____\n" +
        "    _\\/\\\\\\\\//\\\\\\\\/\\\\\\_____\\/\\\\\\___________/\\\\\\/_______\\/\\\\\\///////______\\/\\\\\\//_\\//\\\\\\____\n" +
        "     _\\/\\\\\\_\\//\\\\\\/\\\\\\_____\\/\\\\\\_________/\\\\\\/_________\\/\\\\\\_____________\\/\\\\\\____\\//\\\\\\___\n" +
        "      _\\/\\\\\\__\\//\\\\\\\\\\\\_____\\/\\\\\\_______/\\\\\\/___________\\/\\\\\\_____________\\/\\\\\\_____\\//\\\\\\__\n" +
        "       _\\/\\\\\\___\\//\\\\\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_\\/\\\\\\______\\//\\\\\\_\n" +
        "        _\\///_____\\/////__\\///////////__\\///////////////__\\///////////////__\\///________\\///__\n" +
        "________/\\\\\\\\\\\\\\\\\\_______________________________________________________/\\\\\\_________________________/\\\\\\__\n" +
        " _____/\\\\\\////////_______________________________________________________\\/\\\\\\________________________\\/\\\\\\__\n" +
        "  ___/\\\\\\/________________________________________________________________\\/\\\\\\________________________\\/\\\\\\__\n" +
        "   __/\\\\\\______________/\\\\/\\\\\\\\\\\\\\______/\\\\\\\\\\_____/\\\\____/\\\\___/\\\\________\\/\\\\\\______/\\\\\\\\\\\\\\\\_________\\/\\\\\\__\n" +
        "    _\\/\\\\\\_____________\\/\\\\\\/////\\\\\\___/\\\\\\///\\\\\\__\\/\\\\\\__/\\\\\\\\_/\\\\\\___/\\\\\\\\\\\\\\\\\\____/\\\\\\/////\\\\\\___/\\\\\\\\\\\\\\\\\\__\n" +
        "     _\\//\\\\\\____________\\/\\\\\\___\\///___/\\\\\\__\\//\\\\\\_\\//\\\\\\/\\\\\\\\\\/\\\\\\___/\\\\\\////\\\\\\___/\\\\\\\\\\\\\\\\\\\\\\___/\\\\\\////\\\\\\__\n" +
        "      __\\///\\\\\\__________\\/\\\\\\_________\\//\\\\\\__/\\\\\\___\\//\\\\\\\\\\/\\\\\\\\\\___\\/\\\\\\__\\/\\\\\\__\\//\\\\///////___\\/\\\\\\__\\/\\\\\\__\n" +
        "       ____\\////\\\\\\\\\\\\\\\\\\_\\/\\\\\\__________\\///\\\\\\\\\\/_____\\//\\\\\\\\//\\\\\\____\\//\\\\\\\\\\\\\\/\\\\__\\//\\\\\\\\\\\\\\\\\\\\_\\//\\\\\\\\\\\\\\/\\\\_\n" +
        "        _______\\/////////__\\///_____________\\/////________\\///__\\///______\\///////\\//____\\//////////___\\///////\\//__");
}