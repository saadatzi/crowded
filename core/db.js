const mongoose = require('mongoose');
const config = require('config');
const logger = require('./utils/winstonLogger');

/*
* Mongoose DB Connection
* */
const mongoDB = config.get('mongoDB');
const connectionString = `mongodb://${mongoDB.host}:${mongoDB.port}/${mongoDB.name}`;

module.exports = {
     connectMongoose: () => {
        mongoose.connect(connectionString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })
            .then(poolResult => {
                logger.info('*** Mongoose Server Connection Success ***');
                // CheckException.getException(); //ToDo get init from DB
            })
            .catch(err => {
                logger.error("!!! Mongoose Server Connection catch Failed !!! %j", err);
                setTimeout(connectMongoose, 10000);
            });
    }
};


/*DB Status*/
const dbConnection = mongoose.connection;
dbConnection.on('error', function (err) {
    logger.error("!!!@@@ Mongoose Server Connection on ERROR @@@!!! %j ", err)
});
dbConnection.once('open', function callback() {
    logger.info('@@@ Mongoose Server Connection on OPEN @@@');
});

dbConnection.on('connected', function () {
    logger.info('@@@ Mongoose Server Connection ON CONNECTED @@@');
});

dbConnection.on('disconnected', function () {
    logger.error("!!!@@@ Mongoose Server Connection on disconnected @@@!!! ")
});

process.on('SIGINT', function () {
    dbConnection.close(function () {
        logger.error("!!!!!! Terminated Application nodejs and mongoose disconnected  !!!!!! ")
        process.exit(0)
    });
});
