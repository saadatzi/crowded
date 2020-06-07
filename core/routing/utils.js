const NZ = require('./../utils/nz');
const Setting = require('../models/Setting');

const accessors = {
	0: {key: 'body'},
	1: {
		shouldParse:  true,
		checkFiles:   false,
		getFileArray: true,
		fileCount:    1,
		key:          'body.data'
	},
	2: {key: 'params'},
	3: {
		shouldParse:  true,
		checkFiles:   true,
		key:          'body.data',
		getFileArray: false
	},
	4: {key: 'query'}
};

const reduceJoiMessages = joiErr => {
	// console.log('joi error', joiErr);

	return joiErr.details
		.map(value => value.message)
		.filter(value => value)
		.join('\n');
};

const joiValidate = (schema, accessKey = 0) => (req, res, next) => {
	let { key, shouldParse, checkFiles, fileCount, getFileArray } = accessors[accessKey];
	if (checkFiles && (!req.files || Object.entries(req.files).length === 0))
		return new NZ.Response(false, 'File is required!', 400).send(res);
	if (getFileArray) req.files = Object.values(req.files);
	let data;
	key.split('.').forEach(key => {
		if (data) data = data[key];
		else data = req[key];
	});
	if (shouldParse) data = JSON.parse(data);


	// see if we're dealing with a needy schema
	// if it's not a regular one, it must be function which intakes settings and returns the schema
	// so be it
	if(schema.validate === undefined){
		if(!req._settings) console.error('Dynamic validation schema needs settings, please use "grabSettings" middleware before you pass on a schema like this');
		schema = schema(req._settings || {})
	}

	let {value,error} = schema.validate(data);


	if(error)
		return new NZ.Response(false, reduceJoiMessages(error), 400).send(res);

	req._body = value;

	return next();
};

const grabSettings = () => {
	return async (req, res, next) => {
		let settings = await Setting.find({});
		console.warn("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ grabSettings: ", settings);
		let modified = {};
		for (let i = 0, len = settings.length; i < len; i++) {
			modified[settings[i].key] = settings[i].value;
		}
		req._settings = modified;
		next();
	}
};

module.exports = { joiValidate, grabSettings };
