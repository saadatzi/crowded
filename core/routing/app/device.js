const express = require('express');
const app = express.Router();

const deviceController = require('../../controllers/device');

const NZ = require('../../utils/nz');
const {sign, verifyToken} = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');

const deviceSchema = Joi.object().keys({
	name:		JoiConfigs.title,
	capacity:	Joi.string().regex(/^[0-9.GB]{3,18}$/).required(),
	uid:		Joi.string().regex(/^[A-F0-9-]{36}$/).required(),
	platform:	JoiConfigs.title,
	disk:		Joi.optional()
});

const deviceOsSchema = Joi.object().keys({
	version:	Joi.string().required(),
	type:		Joi.string().allow('iOS', 'Android').required()
});

const addSchema = Joi.object().keys({
	device: 	deviceSchema,
	os: 		deviceOsSchema,
	carriers: 	Joi.optional()
});

const pushTokenSchema = Joi.object().keys({
	notificationToken: 	JoiConfigs.title,
});

app.post('/auth', joiValidate(addSchema), async (req, res) => {
	await deviceController.get(req.body.device.uid)
		.then(async device => {
			if (device) {
				const tokenPayload = {deviceId: device._id};
				if (device.userId) tokenPayload.userId = device.userId;
				const newToken = sign(tokenPayload);

				// maybe changed some value
				device.osVersion = req.body.os.version;
				device.name =  req.body.device.name;
				device.token = newToken;
				await device.save();

				const response = {
					access_token:	newToken,
					access_type:	device.userId ? 'private' : 'public'
				};
				return new NZ.Response(response).send(res);
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
						const response = {
							access_token: newToken,
							access_type: 'public'
						};
						return new NZ.Response(response).send(res);
					})
					.catch(err => {
						console.error("Device Add Catch err:", err);
						new NZ.Response(null, err.message, 500).send(res);
					});
			}
		})
		.catch(err => {
			console.error("Device auth Catch err:", err);
			new NZ.Response(null, err.message, 500).send(res);
		});
});

/**
 *  set Push notification Toke
 * -Update Device in db
 * @return status
 */
//______________________Update Device_____________________//
app.post('/setPushToken', joiValidate(pushTokenSchema), verifyToken(), async (req, res) => {
	console.info('API: Update Device setPushToken/init %j', {body: req.body});
	deviceController.update(req.deviceId, req.body)
		.then(result => {
			new NZ.Response().send(res);
		})
		.catch(err => {
			console.error("Device Update setPushToken Catch err:", err);
			new NZ.Response(null, err.message, 500).send(res);
		});
});

module.exports = app;
