const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

module.exports = {
    title: 				Joi.string().min(3).max(255).required(),
    resource_icon: 		Joi.string().max(255).required(),
    password: 			Joi.string().min(6).max(63).required(),
    boolInt: 			Joi.number().integer().min(0).max(1).required(),
    booleanVal: 		Joi.boolean().required(),
    datetime: 			Joi.date().required(),
    link: 				Joi.string().min(1).max(1000).required(),
    count: 				Joi.number().integer().min(1).required(),
    price: 				Joi.number().min(1).required(),
    numberOptional: 	Joi.number().min(0).optional(),
    phone: 				Joi.number().integer().required(),
    gender: 			Joi.number().valid(1, 2, 3).required(),
    timeStamp: 			Joi.date().timestamp().required(),
    percent: 			Joi.number().min(0).max(100).required(),
    html: 				Joi.string().min(1).required(),
	email: 		 (irRequired = true) => irRequired ?	Joi.string().email().required() : Joi.string().email().allow('').optional(),
	description: (irRequired = true) => irRequired ? Joi.string().min(3).max(1023).required() : Joi.string().min(3).max(1023).optional(),
	array: 		 (irRequired = true) => irRequired ?  Joi.array().required() : Joi.array().optional(),
	arrayLength: (min, max) => Joi.array().min(min).max(max).required(),
	isMongoId: 			Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'ID is invalid').required()
};
