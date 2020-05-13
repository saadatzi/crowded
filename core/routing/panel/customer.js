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
const eventController = require('../../controllers/event');

const { verifyTokenPanel } = require('../../utils/validation');


// Joi validator schemas
const customerListSchema = JoiConfigs.schemas.list({
    filters: {
        status: Joi.number().valid(0, 1).optional()
    },
    sorts:{
        createdAt: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        lastInteract: -1
    }
});

const detailSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
});

const bankAccountDeleteSchema = Joi.object().keys({
    accountId: JoiConfigs.isMongoId
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

const eventListSchema = JoiConfigs.schemas.list({
    filters: {
        status:     Joi.string().valid('APPROVED', 'REJECTED', 'ACTIVE', 'LEFT', 'PAUSED', 'SUCCESS').required()
    },
    sorts:{
        createdAt:  Joi.number().valid(-1,1),
        updatedAt:  Joi.number().valid(-1,1),
    },
    defaultSorts:{
        lastInteract: -1
    }
});


/**
 Get users (customers)
*/
router.post('/', joiValidate(customerListSchema), verifyTokenPanel(), async (req, res) => {
    userController.getManyPanel(req._body)
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
 Get Detail user bank account
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

/**
 Delete user bank accounts
*/
router.delete('/:id/bankAccounts', verifyTokenPanel(), joiValidate(detailSchema, 2), joiValidate(bankAccountDeleteSchema, 0), async (req, res) => {
    userController.deleteBankAccount(req.body.accountId)
        .then(result => {
            console.log(`bank account deleted :${result}`)
            if (result) new NZ.Response('BankAccount deleted successfully!').send(res);
            else throw {message: "sth went wrong when deleting bank account", code:500};
        })
        .catch(err=>{
            console.error(err);
            new NZ.Response(null,err.message,err.code).send(res);
        });
});



/**
 Get users events (customers)
 */
router.post('/', joiValidate(eventListSchema), verifyTokenPanel(), async (req, res) => {
    eventController.getCustomerEvent(req._body)
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
router.get('/:id', joiValidate(detailSchema, 2), verifyTokenPanel(), async (req, res) => {
    userController.getOnePanel(req.params)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});



module.exports = router;
