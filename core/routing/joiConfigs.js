const mongoose = require('mongoose');
const IBAN = require('iban');
const Joi = require('@hapi/joi');
const settingsConf = require('../utils/settings');



module.exports = {
    title: Joi.string().min(3).max(255).required(),
    strOptional: Joi.string().optional(),
    resource_icon: Joi.string().max(255).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9(<!@#$%&*^`~'"|+=\-\\_/?.,>)]{4,63}$/).required(),
    passwordOpt: Joi.string().regex(/^[a-zA-Z0-9(<!@#$%&*^`~'"|+=\-\\_/?.,>)]{4,63}$/).optional(),
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
    isMongoIdOpt: Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'ID is invalid').optional(),
    IBAN: Joi.string().custom((value, helpers) => {
        if (IBAN.isValid(value)) {
            return value;
        } else {
            return helpers.error('any.invalid');
        }
    }, "custom validation"),
    sort: Joi.number().valid(-1,1),

    strValid: (items, isRequired = true) => isRequired ? Joi.string().valid(...items).required() : Joi.string().valid(...items).optional(),
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
            // this schema is two level dynamic
            // gets built by the custom criteria
            // then gets built by the settings coming from the middleware before it
            return (settings) => {

                if (!optFilter || !Object.keys(optFilter).length) throw { message: "optFilter must be defined" };
                if (!optFilter.defaultSorts || !Object.keys(optFilter.defaultSorts).length) throw { message: "optFilter.defaultSorts must be defined and non-empty" };

                optFilter.filters = optFilter.filters && Object.keys(optFilter.filters).length ? optFilter.filters : {};
                optFilter.pagination = optFilter.pagination && Object.keys(optFilter.pagination).length ? optFilter.pagination : {};
                optFilter.sorts = optFilter.sorts && Object.keys(optFilter.sorts).length ? optFilter.sorts : {};
                return Joi.object().keys({
                    search:
                        Joi.string().allow("").optional().default(""),
                    filters:
                        Joi.object().optional()
                            .keys({
                                ...optFilter.filters
                            })
                            .default(),

                    sorts: Joi.object().keys(optFilter.sorts)
                        .not().empty({})
                        .default(optFilter.defaultSorts),
                    pagination:
                        Joi.object().optional()
                            .keys({
                                page: Joi.number().greater(-1).default(0),
                                limit: Joi.number().greater(0).default(() => {
                                    return settings['limitationList'] || settingsConf.panel.defaultLimitPage
                                }),
                                ...optFilter.pagination
                            })
                            .default(),
                });
            }

        }


    }
};
