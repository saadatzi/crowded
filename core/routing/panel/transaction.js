const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate} = require('../utils');

const {sendNotification} = require('../../utils/call');
const settings = require('../../utils/settings');

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
        situation: JoiConfigs.strValid(['PAID', 'UNPAID', 'PENDING'], false),
        status: Joi.number().valid(0, 1).default(1),
    },
    sorts:{
        price: Joi.number().valid(-1,1),
        situation: Joi.number().valid(-1,1),
        eventDate: Joi.number().valid(-1,1),
        createdAt: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        situation: -1,
        createdAt: -1
    }
});

/**
 * Get  Transaction
 * @return Users
 */
//______________________Get Transaction _____________________//
router.post('/', joiValidate(listSchema), verifyTokenPanel(), authorization([{TRANSACTION: 'R'}]), async (req, res) => {
    console.info('API: Get Transaction event/init body:', req._body);

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
            if (item && req.body.isPaid) {
                console.info('******************** API: Get Transaction item', item);
                deviceController.getNotificationId(item.userId)
                    .then(notificationId => {
                        console.info('******************** API: Get Transaction notificationId', notificationId);

                        const value = Math.abs(item.price.toString());
                        const message = settings.notification(value).paid;
                        console.info('******************** API: Get Transaction notification message', message);

                        sendNotification(`myWallet`, [notificationId], message.title, message.desc)
                    })
                    .catch(err => {
                        console.error("manage Transaction sendNotification, getNotificationId Catch:", err);
                    });
            }
            new NZ.Response(true, 'Your request has been successfully submitted').send(res);
        })
        .catch(err => {
            console.error("Get Transaction Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
