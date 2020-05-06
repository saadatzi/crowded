const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const settings = require('../utils/settings');


module.exports = {
    title: Joi.string().min(3).max(255).required(),
    strOptional: Joi.string().optional(),
    resource_icon: Joi.string().max(255).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9(<!@#$%&*^`~'"|+=\-\\_/?.,>)]{4,63}$/).required(),
    boolInt: Joi.number().integer().min(0).max(1).required(),
    booleanVal: Joi.boolean().required(),
    link: Joi.string().min(1).max(1000).required(),
    number: Joi.number().integer().min(1).required(),
    price: Joi.number().min(1).required(),
    numberOptional: Joi.number().min(0).optional(),
    gender: Joi.number().valid(1, 2).required(),
    timeStamp: Joi.date().timestamp().required(),
    percent: Joi.number().min(0).max(100).required(),
    html: Joi.string().min(1).required(),
    isMongoId: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'ID is invalid').required(),

    phone: (isRequired = true) => isRequired ? Joi.string().min(4).max(13).required() : Joi.string().min(4).max(13).optional(),
    datetime: (isRequired = true) => isRequired ? Joi.date().required() : Joi.date().optional(),
    email: (isRequired = true) => isRequired ?
        Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required() :
        Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).allow('').optional(),
    description: (isRequired = true) => isRequired ? Joi.string().min(3).max(1023).required() : Joi.string().min(3).max(1023).optional(),
    array: (isRequired = true, items = Joi.any()) => isRequired ? Joi.array().items(items).required() : Joi.array().items(items).optional(),
    arrayLength: (min, max, items = Joi.any()) => Joi.array().min(min).max(max).items(items).required(),
    object: (item = Joi.any()) => Joi.object({ item }),

    // Frequently used validation schemas
    schemas: {

        list(optFilter) {
            optFilter = optFilter || {},
            optFilter.filters = optFilter.filters || {};
            optFilter.sorts = optFilter.sorts || {};
            optFilter.pagination = optFilter.pagination || {};
            return Joi.object().keys({
                search:
                    Joi.string().allow("").optional().default(""),
                filters:
                    Joi.object().optional()
                        .keys({
                            ...optFilter.filters
                        })
                        .default(),
                sorts:
                    Joi.object().optional()
                        .keys({
                            createdAt: Joi.number().optional().valid(-1, 1).default(sorts => {
                                if (Object.keys(sorts).length === 0) return 1;
                                return undefined;
                            }),
                            updatedAt: Joi.number().optional().valid(-1, 1),
                            ...optFilter.sorts
                        })
                        .min(1)
                        .default(),
                pagination:
                    Joi.object().optional()
                        .keys({
                            page: Joi.number().greater(-1).default(0),
                            limit: Joi.number().greater(0).default(settings.panel.defaultLimitPage),
                            ...optFilter.pagination
                        })
                        .default(),
            })
        }


    }
};
