const express = require('express');
const app = express.Router();
const red = require('../../utils/redis');
const NZ = require('../../utils/nz');
const moment = require('moment');

const settings = require('../../utils/settings');

const CryptoJS = require('crypto-js');

var body_pattern = /([\S\s]*)\.([0-9a-f]{64})$/gim;
// var regex = /mtapp\/([\d\.]+)\/([\d]+);\s*(\w*)/;


function _computeHMAC(text, key = 1) {
	return CryptoJS.HmacSHA256(text, key === 1 ? settings.HASH_key1 : settings.HASH_key2);
}

app.use('/*', (req, res, next) => {
	let lang = 'en';
	if (String(req.get('lang')) == 'ar') lang = 'ar';

	req._lang = lang;
	res._lang = lang;

	return next();
});

app.use('/*', (req, res, next) => {
	req._agent = {
		os:				null,
		env:			null,
		build:			null,
		model:			null,
		version:		null,
		manufacturer: 	null
	}
	if(req.get('nizek-os'))
		req._agent.os = req.get('nizek-os');
	if(req.get('nizek-env'))
		req._agent.env = req.get('nizek-env');
	if(req.get('nizek-build'))
		req._agent.build = req.get('nizek-build');
	if(req.get('nizek-version'))
		req._agent.version = req.get('nizek-version');
	if(req.get('nizek-manufacturer'))
		req._agent.manufacturer = req.get('nizek-manufacturer');

	return next();
});

app.use('/*', (req, res, next) => {
	if (req.get('x-dontcheckme') !== undefined) return next();
	if(req.originalUrl.includes('transaction-check?tap_id')) return next(); //TODO: make better

	const reqid = req.get('x-reqid');

	if (String(reqid).length < 1) return new NZ.Response(null, `Missing RequestID`, 410).send(res);

	let toCheck = reqid;

	if (req.get('content-length')) toCheck += req.get('content-length');
	if (req.get('x-token')) toCheck += req.get('x-token');
	let computed_check_hash = _computeHMAC(toCheck, 2);

	if (computed_check_hash != req.get('x-hash'))
		return new NZ.Response(null, `Hash not right (x-hash)`, 410).send(res);

	const unixNow = moment().unix();
	red.zremrangebyscore(['ReqIDs', 0, unixNow]);
	//console.log("GOT:: "+req.headers["x-reqid"]);
	red.zrank(['ReqIDs', reqid], function(err, reply) {
		if (reply) return new NZ.Response(null, `Duplicate Request: ${reqid}`, 429).send(res);

		const ttlDate = moment()
			.add(10, 'minutes')
			.unix();
		red.zadd(['ReqIDs', ttlDate, reqid], function(err, reply) {
			//console.log(err);
			//console.log(reply);
		});

		return next();
	});
});

app.use('/*', (req, res, next) => {
	// console.log('passed through meeee');
	if (req.method != 'POST') return next();
	req.rawBody = '';
	req.setEncoding('utf8');

	req.on('data', chunk => {
		req.rawBody += chunk;
	});

	req.on('end', function() {
		var k = req.rawBody.toString('utf8');
		var _match = body_pattern.exec(k);
		body_pattern.lastIndex = 0;

		if (!_match){
			if (req.get('x-dontcheckme') !== undefined) {
				try {
					req.body = JSON.parse(req.rawBody);
				} catch (e) {
					req.body = {};
				} finally {
					return next();
				}
			}
			return new NZ.Response(null, 'hash error1', 408).send(res);
		}

		var json_str = _match[1];
		var challenge_hash = _match[2];
		var computed_hash = _computeHMAC(json_str);
		if (computed_hash == challenge_hash) {
			try {
				req.body = JSON.parse(json_str);
			} catch (e) {
				req.body = {};
				console.log('JSON Parse Error on api:', e);
			} finally {
				next();
			}
		} else {
			return new NZ.Response(null, 'hash error2', 408).send(res);
		}
	});
});

const E = require('../../utils/events');

app.get('/', async (req, res) => {
	E.emit('api.home');
	return new NZ.Response('crowded stuff coming at ya...').send(res);
});

app.use('/device', 		require('./device'));
app.use('/interest', 	require('./interest'));


module.exports = app;