const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate, grabSettings } = require('../utils');

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

const multiPaidSchema = Joi.object().keys({
    transactionIds: JoiConfigs.array(true, JoiConfigs.isMongoId),
    isPaid: JoiConfigs.booleanVal
});


const listSchema = JoiConfigs.schemas.list({
    filters:{
        situation: JoiConfigs.strValid(['PAID', 'UNPAID', 'PENDING'], false),
        fromDate: Joi.date().timestamp(),
        toDate: Joi.date().timestamp(),
    },
    sorts:{
        fullName: JoiConfigs.sort,
        transactionId: JoiConfigs.sort,
        price: JoiConfigs.sort,
        situation: JoiConfigs.sort,
        createdAt: JoiConfigs.sort,
        bankName: JoiConfigs.sort,
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
router.post('/', grabSettings(), joiValidate(listSchema), verifyTokenPanel(), authorization([{TRANSACTION: 'R'}]), async (req, res) => {
    console.info('API: Get Transaction/init body:', req._body);

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
 * Get  Transaction
 * @return Users
 */
//______________________Get Transaction _____________________//
router.post('/export', joiValidate(listSchema), verifyTokenPanel(), authorization([{TRANSACTION: 'R'}]), async (req, res) => {
    console.info('API: Get Transaction export/init body:', req._body);

    transactionController.getExportTransaction(req._body)
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
//______________________Set Transaction _____________________//
router.post('/manage', joiValidate(manageSchema), verifyTokenPanel(), authorization([{TRANSACTION: 'RU'}]), async (req, res) => {
    console.info('API: Set Transaction Paid/init %j', {body: req.body});

    transactionController.manageTransaction(req.body.transactionId, req.body.isPaid)
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

/**
 * Set  Transaction Multi(multi paid)
 * @return Boolean
 */
//______________________Set Multi Transaction _____________________//
router.post('/multiPaid', joiValidate(multiPaidSchema), verifyTokenPanel(), authorization([{TRANSACTION: 'RU'}]), async (req, res) => {
    console.info('API: Set Multi Transaction Paid/init %j', {body: req.body});

    const optFilter = {_id: {$in: req.body.transactionIds}};
    transactionController.manageTransaction(optFilter, req.body.isPaid)
        .then(items => {
            if (items && req.body.isPaid) {
                transactionController.get(optFilter)
                    .then(transactions => {
                        console.info('******************** API: multiPaid transactions', transactions);

                        transactions.map(transaction => {
                            deviceController.getNotificationId(transaction.userId)
                                .then(notificationId => {
                                    console.info('******************** API: Get Transaction notificationId', notificationId);

                                    const value = Math.abs(transaction.price.toString());
                                    const message = settings.notification(value).paid;
                                    console.info('******************** API: Get Transaction notification message', message);

                                    sendNotification(`myWallet`, [notificationId], message.title, message.desc)
                                })
                                .catch(err => {
                                    console.error("manage Transaction sendNotification, getNotificationId Catch:", err);
                                });
                        })
                    })
                    .catch(err => {
                        console.error("Get Transaction for notif Catch err:", err);
                    })
            }
            new NZ.Response(true, 'Your request has been successfully submitted').send(res);
        })
        .catch(err => {
            console.error("Get Transaction Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
