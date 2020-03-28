const express = require('express');
const app = express.Router();

const deviceModel = require('../../models/deviceModel');
const userModel = require('../../models/userModel');

const NZ = require('../../utils/nz');

const Joi = require('@hapi/joi');

app.post('/auth', async (req, res, next) => {
	let result;
	const schema = Joi.object().keys({
		device:	Joi.object().keys({
			name:		Joi.string().required(),
			capacity:	Joi.string().regex(/^[0-9.GB]{3,18}$/).required(),
			uid:		Joi.string().regex(/^[A-F0-9-]{36}$/).required(),
			platform:	Joi.string().required()
		}).required(),

		os: Joi.object().keys({
			version:	Joi.string().required(),
			type:		Joi.string().allow('iOS', 'Android').required()
		}).required()
	});

	result = schema.validate({
		device:	req.body.device,
		os:		req.body.os
	});

	let response = {};

	if (result.error)
		return new NZ.Response(result.error, 'input error.', 400).send(res);
	
	let user_id = null;
	const device = await deviceModel.getByIdentifier(req.body.device.uid);

	if (device) {
		const data = {
			osVersion: req.body.os.version,
			name: req.body.device.name,
			capacity: req.body.device.capacity
		};
		await deviceModel.updateDevice(req.body.device.uid, data);

		const nDevice = await deviceModel.getByIdentifierAndToken(req.body.device.uid, req.headers['x-token']);
		if (nDevice) user_id = nDevice.user_id;

		const token = await deviceModel.setTokenAndUser(device.identifier, user_id);
		response = {
			access_token:	token,
			access_type:	user_id ? 'private' : 'public'
		};
		if (user_id) 
			response.user = NZ.outputUser(await userModel.get(user_id));

	} else {

		const deviceInfo = {
			identifier: req.body.device.uid,
			osType: req.body.os.type,
			osVersion: req.body.os.version,
			title: req.body.device.platform,
			name: req.body.device.name,
			capacity: req.body.device.capacity
		};
		const device = await deviceModel.insertDevice(deviceInfo);
		
		response = {
			access_token: device.token,
			access_type: 'public'
		};
	}

	return new NZ.Response(response).send(res);
});

module.exports = app;
