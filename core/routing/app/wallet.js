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
            console.info("*** Wallet List.length :", result.length);
            // console.info("*** Wallet List: ", result);
            let nextPage = null;
            if (result.length > settings.wallet.limitPage) {
                nextPage = page + 1;
                const x = result.pop();
                // console.log(">>>>>>>>>>>>>>> x.pop:", x);
            }
            new NZ.Response({items: result, nextPage,}).send(res);
        })
        .catch(err => {
            console.error("Wallet Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })

    /*new NZ.Response({items: [
            {
                id: '321a123',
                value: '50.00',
                title: 'Ochello`s catwalk fiesta 1',
                date: new Date(),
                isDebtor: false,
            },
            {
                id: '321a1234',
                value: '70.00',
                title: 'Ochello`s catwalk fiesta 2',
                date: new Date(),
                isDebtor: false,
            },
            {
                id: '321a1235',
                value: '120.00',
                title: 'withdrawn the wallet',
                date: new Date(),
                isDebtor: true,
            },
            {
                id: '321a126',
                value: '150.00',
                title: 'Ochello`s catwalk fiesta 3',
                date: new Date(),
                isDebtor: false,
            },
            {
                id: '321a1237',
                value: '90.00',
                title: 'Ochello`s catwalk fiesta 4',
                date: new Date(),
                isDebtor: false,
            },
            {
                id: '321a128',
                value: '30.00',
                title: 'Ochello`s catwalk fiesta 5',
                date: new Date(),
                isDebtor: false,
            },

        ],
        withdraw: '270.00',
        totalEarned: '2050.00',
        thisWeek: '150.00',
        nextPage: null
    }).send(res);*/
});

/**
 * Apply Wallet
 * @return list of wallet
 */
//______________________Apply Wallet_____________________//
router.post('/', verifyToken(true),async function (req, res) {
    const applyWalletSchema = Joi.object().keys({
        walletId: Joi.string().length(24).required(),
    });
    let applyWalletValidation = applyWalletSchema.validate({walletId: req.body.walletId});
    if (applyWalletValidation.error)
        return new NZ.Response(applyWalletValidation.error, 'input error.', 400).send(res);

    userEventController.add(req.body.walletId, req.userId)
        .then(result => {
            new NZ.Response({status: result.status}).send(res);
        })
        .catch(err => {
            console.error("Wallet Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })

});


module.exports = router;
