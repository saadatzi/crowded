const express = require('express');
const app = express.Router();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));

app.use('/*', (req, res, next) => {
	let lang = 'en';
	if (String(req.get('lang')) == 'ar') lang = 'ar';

	req._lang = lang;
	res._lang = lang;


	return next();
});


app.use('/interest', 	require('./interest'));
app.use('/area', 		require('./area'));
app.use('/event', 		require('./event'));


module.exports = app;