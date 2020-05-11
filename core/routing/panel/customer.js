const express = require('express')
    , router = express.Router();

// Utils
const NZ = require('../../utils/nz');

// Validation requirements
const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate } = require('./../utils');

// Grab controller
const userController = require('../../controllers/user');


// Grab models
const User = require('../../models/User');

// Instantiate the Device Model
const { verifyTokenPanel } = require('../../utils/validation');


// Joi valdiator schemas

const customerListSchema = JoiConfigs.schemas.list({
    filters: {
        status: Joi.number().valid(0, 1).optional()
    },
    sorts:{
        createdAt: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        createdAt: -1
    }
});

const detailSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
});

const bankAccountDetailSchema = detailSchema.keys({
    accountId: JoiConfigs.isMongoId,
});

const bankAccountListSchema = JoiConfigs.schemas.list({
    filters: {
        status: Joi.number().valid(0, 1).optional()
    },
    sorts:{
        createdAt: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        createdAt: -1
    }
});


/**
 Get users (customers)
*/
router.post('/', verifyTokenPanel(), joiValidate(customerListSchema, 0), async (req, res) => {
    userController.getManyPanel(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});


/**
 Get user detail (customer)
*/
router.get('/:id', verifyTokenPanel(), joiValidate(detailSchema, 2), async (req, res) => {
    userController.getOnePanel(req.params)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});


/**
 Get user bank accounts
*/
router.post('/:id/bankAccounts', verifyTokenPanel(), joiValidate(detailSchema, 2), joiValidate(bankAccountListSchema, 0), async (req, res) => {
    userController.getBankAccountsList(req.params.id,req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});

/**
 Get user bank accounts
*/
router.get('/:id/bankAccounts/:accountId', verifyTokenPanel(), joiValidate(bankAccountDetailSchema, 2), async (req, res) => {
    userController.getBankAccountDetail(req.params.accountId)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});





module.exports = router;
