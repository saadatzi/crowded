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


// Joi valdiator schemas
//TODO add validation JOI

/**
 * Get  Transaction
 * @return Users
 */
//______________________Get Transaction _____________________//
router.post('/', verifyTokenPanel(), authorization([{TRANSACTION: 'R'}]), async (req, res) => {
    console.info('API: Get Transaction event/init %j', {body: req.body});

    transactionController.getPanelTransaction(req._admin, req.body, req.auth)
        .then(items => {
            new NZ.Response({items}).send(res);
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
router.post('/manage', verifyTokenPanel(), authorization([{EVENT: 'R'}, {USER: 'R'}, {PARTICIPANTS: 'U'}]), async (req, res) => {
    console.info('API: Get Transaction event/init %j', {body: req.body});

    userController.manageParticipant(req._admin, req.body, req.auth)
        .then(item => {
            new NZ.Response(true, 'Your request has been successfully submitted').send(res);
        })
        .catch(err => {
            console.error("Get Transaction Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
