const express = require('express')
    , router = express.Router();

// Utils
const NZ = require('../../utils/nz');

// Validation requirements
const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate } = require('./../utils');

// Grab controller
const bankAccountController = require('../../controllers/bankAccount');

// Instantiate the Device Model
const { verifyToken } = require('../../utils/jwt');


// Joi valdiator schemas

const addSchema = Joi.object().keys({
    firstname: JoiConfigs.title,
    lastname: JoiConfigs.title,
    bankNameId: JoiConfigs.isMongoId,
    IBAN: JoiConfigs.title, //TODO: strong validation
    phoneNumber: JoiConfigs.phone, //TODO: strong validation
    civilId: JoiConfigs.title //TODO: strong validation
});

/**
 Add Bank Account
 */
router.post('/add', joiValidate(addSchema, 0), verifyToken(true), async function (req, res) {
    bankAccountController.add(req.userId, req.body)
        .then(result => {
            console.info("***User BankAccount inserted : %j", result);
            new NZ.Response(null, 'Bank account has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Add bank account catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })

});

/**
 Get Bank Accounts
 */
router.get('/', verifyToken(true), async function (req, res) {
    bankAccountController.get({ criteria: { userId: req.userId }, lang: req._lang })
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Get bank accounts catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })

});

module.exports = router;
