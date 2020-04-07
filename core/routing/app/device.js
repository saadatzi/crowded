const express = require('express');
const app = express.Router();

const deviceController = require('../../controllers/device');

const NZ = require('../../utils/nz');
const {sign} = require('../../utils/jwt');

const Joi = require('@hapi/joi');

app.post('/auth', async (req, res, next) => {
	let result;
	const schema = Joi.object().keys({
		device:	Joi.object().keys({
			name:		Joi.string().required(),
			capacity:	Joi.string().regex(/^[0-9.GB]{3,18}$/).required(),
			uid:		Joi.string().regex(/^[A-F0-9-]{36}$/).required(),
			platform:	Joi.string().required(),
			disk:		Joi.optional()
		}).required(),

		os: Joi.object().keys({
			version:	Joi.string().required(),
			type:		Joi.string().allow('iOS', 'Android').required()
		}).required(),

		carriers: 		Joi.optional()
	});

	result = schema.validate({
		device:	req.body.device,
		os:		req.body.os
	});

	let response = {};

	if (result.error)
		return new NZ.Response(result.error, 'input error.', 400).send(res);
	
	const device = await deviceController.get(req.body.device.uid);


	if (device) {
		// maybe changed some value
		device.osVersion = req.body.os.version;
		device.name =  req.body.device.name;
		await device.save();

		response = {
			access_token:	device.token,
			access_type:	device.userId ? 'private' : 'public'
		};
		// if (user_id)
		// 	response.user = NZ.outputUser(await userModel.get(device.user_id));

	} else {

		const deviceInfo = {
			identifier: req.body.device.uid,
			osType: req.body.os.type,
			osVersion: req.body.os.version,
			title: req.body.device.platform,
			name: req.body.device.name,
			capacity: req.body.device.capacity
		};
		await deviceController.add(deviceInfo)
			.then(newDevice => {
				const newToken = sign({deviceId: newDevice._id});
				newDevice.token = newToken;
				newDevice.save();
				response = {
					access_token: newToken,
					access_type: 'public'
				};
			})
			.catch(err => {});


	}

	return new NZ.Response(response).send(res);
});

module.exports = app;
