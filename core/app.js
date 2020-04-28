/**
 * Module dependencies
 */
const path = require('path');

var os = require('os');
const express = require('express');
const app = express();
const responseTime = require('response-time');
// const proxy = require('http-proxy-middleware');
const fs = require('fs');
// const mongoose = require('mongoose');
const settings = require('./utils/settings');

const helmet = require('helmet');

const {logger, isAPIChecker} = require('./utils/logger');

const {verifyToken} = require('./utils/jwt');
const logController = require('./controllers/log');
// const CheckException = require('./utils/CheckException');


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
* Crashlytics with Sentry
* */
// const Sentry = require('@sentry/node');
// Sentry.init({ dsn: 'https://f98cd6b285684a15a2596ed1f1744c2d@sentry.io/2147980' });
// app.use(Sentry.Handlers.requestHandler());

/*
* disable express cash
* */
app.disable('etag');

app.use(function (req, res, next) {
    req._ip = '127.0.0.1';
    if(req.headers['x-forwarded-for'])
        req._ip = req.headers['x-forwarded-for'].split(',')[0];

    next();
});


const ncs_localization_options = {
    'NizekUtils.Localizations.Dump.Enabled':   settings['NizekUtils.Localizations.Dump.Enabled'],
    'NizekUtils.Localizations.Dump.Interval':  settings['NizekUtils.Localizations.Dump.Interval'],
    'NizekUtils.Localizations.Fetch.Interval': settings['NizekUtils.Localizations.Fetch.Interval']
};
require('./utils/ncs/ncs.localization').init('com.nizek.crowded', ncs_localization_options);


/*
* Cross-Origin
* */
app.use(function (req, res, next) {
    const allowedOrigins = ['http://localhost:3000', 'https://panel.kids.dev.nizek.com'];
    const origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-PySign, X-PyMod, PyToken, X-PyReq');
    res.header('Access-Control-Allow-Credentials', true);
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Max-Age', '86400');
        res.writeHead(200);
        return res.end();
    }
    return next();
});


/*
* DB Store API request
* */
app.use(
    responseTime(function(req, res, time) {
        let user = null;
        if (req.userId) {
            user = req.userId;
        }
        if (req._admin) {
            user = req._admin.id;
        }
        let device = null;
        if (req.deviceId) {
            device = req.deviceId;
        }

        const insert = {
            userId:      user,
            deviceId:    device,
            path:         req.originalUrl,
            ip:           req.headers['x-real-ip'],
            token:        req.headers['x-token'],
            browser:      req.headers['user-agent'],
            method:       req.method,
            responseCode: res.statusCode,
            responseTime: time,
            headers:      req.headers
        };
        const realPath = req.baseUrl + req._parsedUrl.pathname;
        if (typeof req.body == 'object' && req.method == 'POST') {

            insert.body = req.body;
        }

        if(!isAPIChecker(req))
            logController.add(insert)
    })
);

/*
* API log with morgan logger
* */
app.use(logger('PyLog', {
    skip: function (req, res) {
        return isAPIChecker(req);
    }
}));

/*
* Authentication JWT
* */
// app.use(verifyToken);


/*
* start Routing
* */
app.use('/', require('./routing'))

// start server
const port = process.env.NODE_ENV === 'production' ? settings.serverConfig.productPort : settings.serverConfig.port;

var server = app.listen(port, function () {
    console.log('********* Server is running on Port: %s', port);
});
server.setTimeout(10 * 60 * 1000);


// server Crash Handle
process.on('unhandledRejection', (reason, promise) => {
    console.error('!!!!! SERVER unhandledRejection at:', reason.stack || reason || promise);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
process.on('uncaughtException', function (err) {
    console.error('!!!!! SERVER uncaughtException err:', err);
});

if (process.env.NODE_APP_INSTANCE === '0') {
    require('./singleRun');

    /*logo Start App*/
    console.info("\n__/\\\\\\\\\\_____/\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\________/\\\\\\_\n" +
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