const express = require('express');
const app = express.Router();
const path = require('path');
const NZ = require('../utils/nz');
const os = require('os');

/*
* start Routing
* */
app.use('/assets', express.static(path.join(__dirname, './templates/default/assets')));
app.use(`/panel/assets`, express.static(path.join(__dirname, './templates/default/assets')));

app.use('/app', 			require('./app'));
app.use('/static', 			require('./static'))
app.use('/panel', 			require('./panel'));


app.get('/', function (reg, res) {
    var resp = new NZ.Response('Welcome to Crowded. -' + os.hostname());
    resp.send(res);
});

module.exports = app;