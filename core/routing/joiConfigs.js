const BaseJoi = require('@hapi/joi');
const JoiDateExtension = require('@hapi/joi-date');
// const JoiPhoneExtension = require('joi-international-phone');
let Joi = BaseJoi.extend(JoiDateExtension);

const idInt = Joi.number()
	.integer()
	.required();
const duration = Joi.number()
	.integer()
	.min(0)
	.required();
const title = Joi.string()
	.min(3)
	.max(255)
	.required();
const html = Joi.string().min(1).required();
const name = title;
const type = title;
const resource_icon = Joi.string()
	.max(255)
	.required();
const email = Joi.string()
	.email()
	// .regex(/^[a-zA-Z0-9_\.]+@\w+\.\w+/)
	.required();

const emailOptional = Joi.string().email().allow('').optional();

const description = Joi.string()
	.min(3)
	.max(1023)
	.required();
const optionalText = Joi.string().max(1023).allow('').optional();

const password = Joi.string().min(6).max(63).required();
const role = Joi.number().required();
const array = Joi.array().required();
const arrayOptional = Joi.array().optional();
const idArray = Joi.array().items(idInt).required();
const boolInt = Joi.number()
	.integer()
	.min(0)
	.max(1)
	.required();
const averageCalorie = Joi.number()
	.integer()
	.min(1)
	.required();
const booleanVal = Joi.boolean().required();
const tag = Joi.string()
	.max(255)
	.allow('')
	.allow(null)
	.optional();
const days99 = Joi.number()
	.min(1)
	.max(99)
	.required();
const daysPlan = Joi.array().required();
const link = Joi.string()
	.min(1)
	.max(1000)
	.required();
const datetime = Joi.date().required();
const targetJson = Joi.object()
	.keys({
		id:   idInt,
		text: title
	})
	.required();
	
const targetJsonSelected = Joi.object()
	.keys({
		id:   name,
		text: title
	})
	.required();

const targetJsonFixed = Joi.alternatives().try(targetJson, targetJsonSelected);

const count = Joi.number()
	.integer()
	.min(1)
	.required();

const price = Joi.number()
	.min(1)
	.required();

const priceOptional = Joi.number().min(0).optional();

const numberOptional = Joi.number().min(0).optional();

const percent = Joi.number().min(0).max(100).required();

const location = Joi.number().min(-180).max(180).required();

const phone = Joi.number().integer().required();

const imageMeta = Joi.object().keys({
	meta:	Joi.object().keys({
		type:	name,
		id:		idInt
	}),
	server:	Joi.optional(),
	input:	Joi.optional(),
	output:	Joi.optional(),
	actions:Joi.optional(),
	size:	Joi.optional(),
	filters:Joi.optional(),
	minSize:Joi.optional()
});

const weekdays = Joi.array().items(Joi.string().valid('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday').required()).min(1).required();
const gender = Joi.number().valid(1, 2, 3).required();
const date = Joi.date().format('YYYY-MM-DD').required();
const time = Joi.date().format('H:m').required();

module.exports = {
	idInt,
	idArray,
	title,
	name,
	type,
	resource_icon,
	email,
	password,
	role,
	description,
	duration,
	array,
	arrayOptional,
	boolInt,
	averageCalorie,
	booleanVal,
	tag,
	days99,
	daysPlan,
	datetime,
	link,
	targetJson,
	targetJsonSelected,
	count,
	price,
	priceOptional,
	phone,
	optionalText,
	location,
	imageMeta,
	weekdays,
	gender,
	date,
	time,
	percent,
	html,
	numberOptional,
	emailOptional,
	targetJsonFixed
};
