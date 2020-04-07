const express = require('express');
const app = express.Router();

const NZ = require('../utils/nz');
const os = require('os');

/*
* start Routing
* */
app.use('/app', 			require('./app'));
app.use('/panel', 			require('./panel'));


app.get('/', function (reg, res) {
    var resp = new NZ.Response('Welcome to Crowded. -' + os.hostname());
    resp.send(res);
});

module.exports = app;