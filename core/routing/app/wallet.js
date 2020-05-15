const express = require('express')
    , router = express.Router();
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

// Instantiate the Device Model
const transactionController = require('../../controllers/transaction');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/validation');
const settings = require('../../utils/settings');
const controllerUtils = require('../../controllers/utils');


/**
 * Get Wallet
 * @param @optional page
 * @return list of wallet
 */
//______________________Get Wallet_____________________//
router.get('/myWallet', verifyToken(true), async function (req, res) {
    console.info('API: Get wallet/init req.query', req.query);
    let selected;

    transactionController.myTransaction(req.userId, req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en', req.query.page, req.query.date)
        .then(result => {
            new NZ.Response(result ? result : {items: [], nextPage: null}).send(res);
        })
        .catch(err => {
            console.error("Wallet Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
});

/**
 * Get Wallet Total
 * @return list of wallet
 */
//______________________Get Wallet_____________________//
router.get('/myWalletTotal', verifyToken(true), async function (req, res) {
    console.info('API: Get walletTotal/init req.query', req.query);
    let selected;

    const userHash = await controllerUtils.createMyWalletChartHash(req.userId);
    transactionController.myTransactionTotal(req.userId, req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en', req.query.page, req.query.date)
        .then(result => {
            new NZ.Response(result ? Object.assign(result, {chart: {url: settings.static_route + `myWalletChart/${userHash}`}}) : null).send(res);
        })
        .catch(err => {
            console.error("walletTotal Get Catch err:", err);
            new NZ.Response(null, err.message, 500).send(res);
        })
});


/**
 * Request withdraw
 */
//______________________Set Withdraw Event_____________________//
router.post('/withdraw', verifyToken(true), async function (req, res) {
    console.info('API: Wallet Withdraw wallet/init', req.body);
    if (!mongoose.Types.ObjectId.isValid(req.body.bankId)) {
        return new NZ.Response({
            title: 'input error',
            message: 'bankId must be a valid id'
        }, 'input error.', 400).send(res);
    }
    //TODO Joi fo Total

    transactionController.requestWithdraw(req.userId, req.body.bankId, req.body.total)
        .then(withdrawn => {
            console.info("*** requestWithdraw Status : %j", withdrawn);
            new NZ.Response(null, 'Submit request withdraw has been successfully').send(res);
        })
        .catch(err => {
            console.error("Wallet Set Withdraw Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
