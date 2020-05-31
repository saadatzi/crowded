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
const bankNameController = require('../../controllers/bankName');


// Instantiate the Device Model
const { verifyToken } = require('../../utils/validation');


// Joi valdiator schemas

const addSchema = Joi.object().keys({
    firstname: JoiConfigs.title,
    lastname: JoiConfigs.title,
    bankNameId: JoiConfigs.isMongoId,
    IBAN: JoiConfigs.IBAN, //TODO: strong validation
    phoneNumber: JoiConfigs.phone, //TODO: strong validation
    civilId: JoiConfigs.title //TODO: strong validation
});

/**
 Get Bank Names
 */
router.get('/name', verifyToken(true), async function (req, res) {
    let bankNames = await bankNameController.get({ lang: req._lang });
    new NZ.Response(bankNames).send(res);
    // bankNameController.add(prepared);
});

/**
 Add Bank Account
 */
router.post('/account/add', joiValidate(addSchema, 0), verifyToken(true), async function (req, res) {
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
router.get('/account', verifyToken(true), async function (req, res) {
    bankAccountController.get({ criteria: { userId: req.userId }, lang: req._lang })
        .then(result => { new NZ.Response({ items: result }).send(res); })
        .catch(err => {
            console.error("Get bank accounts catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })

});

/**
 Delete Bank Account
 */
router.post('/account/delete', verifyToken(true), async function (req, res) {
    let id = req.body.id;
    return bankAccountController.changeStatus(id, 0)
        .then(result => { new NZ.Response(null,"BankAccount deleted successfully").send(res)})
        .catch(err => {
            console.error("Get bank accounts catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })

});

module.exports = router;
