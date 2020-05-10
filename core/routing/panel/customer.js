const express = require('express')
    , router = express.Router();

// Utils
const NZ = require('../../utils/nz');

// Validation requirements
const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate } = require('./../utils');

// Grab controller
// const bankAccountController = require('../../controllers/bankAccount');
// const bankNameController = require('../../controllers/bankName');


// Grab models
// const BankAccount = require('../../models/BankAccount');

// Instantiate the Device Model
const { verifyTokenPanel } = require('../../utils/validation');


// Joi valdiator schemas



const addSchema = Joi.object().keys({
    sorts: Joi.object().keys({
        username: Joi.string().alphanum().min(3).max(30).optional(),
        password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).optional(),
    }).not().empty({}).default({
        username: "joey",
        password: "owieihf98023",
        agena: true
    })

});

/**
 Get Bank Names
*/
router.post('/', verifyTokenPanel(), joiValidate(addSchema, 0), async (req, res) => {
    res.json(req._body);
});




module.exports = router;
