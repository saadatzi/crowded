const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

// Instantiate the Device Model
const transactionController = require('../../controllers/transaction');
const userEventController = require('../../controllers/userEvent');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/jwt');
const settings = require('../../utils/settings');


/**
 * Get Wallet
 * @param @optional page
 * @param @optional lat
 * @param @optional lon
 * @return list of wallet
 */
//______________________Get Wallet_____________________//
router.get('/myWallet', verifyToken(true), async function (req, res) {
    console.info('API: Get wallet/init req.query', req.query);
    let selected;

    transactionController.myTransaction(req.userId, req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en', req.query.page, req.query.date)
        .then(result => {
            new NZ.Response(Object.assign(result, {chart: {url: 'https://nizek.com'}})).send(res);
        })
        .catch(err => {
            console.error("Wallet Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
});


module.exports = router;
