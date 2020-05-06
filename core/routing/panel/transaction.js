const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate} = require('../utils');

// Instantiate the Device Model
const transactionController = require('../../controllers/transaction');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader, multiUploader} = require('../../utils/fileManager');
const {verifyTokenPanel, authorization} = require('../../utils/validation');

const User = require('../../models/User');

const locationSchema = Joi.object().keys({
    coordinates: JoiConfigs.arrayLength(2, 2, JoiConfigs.number)
});


// Joi validator schemas
const manageSchema = Joi.object().keys({
    transactionId: JoiConfigs.isMongoId,
    isPaid: JoiConfigs.booleanVal
});


const listSchema = JoiConfigs.schemas.list({
    filters:{
        status: Joi.number().valid(0, 1, 2).default(1),
    }
});

/**
 * Get  Transaction
 * @return Users
 */
//______________________Get Transaction _____________________//
router.post('/', verifyTokenPanel(), authorization([{TRANSACTION: 'R'}]), joiValidate(listSchema,0), async (req, res) => {
    console.info('API: Get Transaction event/init %j', {body: req.body});

    transactionController.getPanelTransaction(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Get Transaction Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 * Set  Transaction
 * @return Boolean
 */
//______________________Get Transaction _____________________//
router.post('/manage', joiValidate(manageSchema), verifyTokenPanel(), authorization([{TRANSACTION: 'RU'}]), async (req, res) => {
    console.info('API: Get Transaction event/init %j', {body: req.body});

    transactionController.manageTransaction(req.body.transactionId, req.body.isPaid, req._admin)
        .then(item => {
            new NZ.Response(true, 'Your request has been successfully submitted').send(res);
        })
        .catch(err => {
            console.error("Get Transaction Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
