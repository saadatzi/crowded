const express = require('express');
const app = express.Router();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));



app.use('/interest', 	require('./interest'));
app.use('/area', 		require('./area'));
app.use('/event', 		require('./event'));
app.use('/role', 		require('./role'));
app.use('/org', 		require('./organization'));
// app.use('/agent', 		require('./agent'));


module.exports = app;