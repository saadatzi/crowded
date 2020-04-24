const mongoose = require('mongoose');
/*
* Mongoose DB Connection
* */
const {mongoDB} = require('./utils/settings');
const connectionString = `mongodb://${mongoDB.user}:${mongoDB.pass}@${mongoDB.host}:${mongoDB.port}/${mongoDB.dbName}`;

module.exports = {
     connectMongoose: () => {
        mongoose.connect(connectionString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
            .then(poolResult => {
                console.log('*** Mongoose Server Connection Success ***');
                // CheckException.getException(); //TODO get init from DB
            })
            .catch(err => {
                console.error("!!! Mongoose Server Connection catch Failed !!! %j", err);
                setTimeout(() => this.connectMongoose, 10000);
            });
    }
};


/*DB Status*/
const dbConnection = mongoose.connection;
dbConnection.on('error', function (err) {
    console.error("!!!@@@ Mongoose Server Connection on ERROR @@@!!! %j ", err)
});
dbConnection.once('open', function callback() {
    console.log('@@@ Mongoose Server Connection on OPEN @@@');
});

dbConnection.on('connected', function () {
    console.log('@@@ Mongoose Server Connection ON CONNECTED @@@');
});

dbConnection.on('disconnected', function () {
    console.error("!!!@@@ Mongoose Server Connection on disconnected @@@!!! ")
});

process.on('SIGINT', function () {
    dbConnection.close(function () {
        console.error("!!!!!! Terminated Application nodejs and mongoose disconnected  !!!!!! ")
        process.exit(0)
    });
});