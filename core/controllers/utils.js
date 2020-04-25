const settings = require('../utils/settings');
const path = require('path');
const uuid = require('node-uuid');
const nodemailer = require('nodemailer');
const moment_tz = require('moment-timezone');
const moment = require('moment');

const {insertForgotHash} = require('../utils/cacheLayer')

const NZ = require('../utils/nz');

const createResetPasswordHash = async (userId) => {
	const hash = NZ.sha512(uuid.v4() + 'NIZEK_CROWDED' + moment().format('x'));
	await insertForgotHash(hash, userId);

	return hash;
};

const resolveMediaPath = (items, key) => {
	try {
		if (!Array.isArray(items)) items = [items];
		items.forEach((item, index) => {
			items[index][key] = settings.panel_cdn + item[key];
		});
	} catch (e) {
		console.log('error', e.toString());
	}

	return items;
};

const sendEmail = async (to, subject, page, options) => {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth:    {
			user: settings.mail.username,
			pass: settings.mail.password
		}
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: `"${settings.mail.from_name}" <${settings.mail.from}>`,
		to,
		subject,
		//TODO text: "Hello world?", // plain text body
		// html: engine.render(path.join(process.cwd(), `/templates/email/${page}.dot`), {
		// 	...options
		// })
	});

	return info.messageId;
};

const utcToKuwaitTimezone = async ({ collection, utcKey = 'CDate', kuwaitKey = 'CDate', shouldGetDate = false }) => {
	collection.forEach(value => {
		let datetime = moment_tz(value[utcKey]).tz('Asia/Kuwait');
		value[kuwaitKey] = shouldGetDate ? datetime.format('YYYY-MM-DD') : datetime;
	});

	return collection;
};

module.exports = {
	sendEmail,
	utcToKuwaitTimezone,
	createResetPasswordHash,
	resolveMediaPath
};