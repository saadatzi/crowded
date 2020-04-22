const express = require('express')
    , router = express.Router();
// const jwtRun = require('../../utils/jwt')
const mongoose = require('mongoose');
// const Joi = require('@hapi/joi');

// Instantiate the Device Model
const bankAccountController = require('../../controllers/bankAccount');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/jwt');
const settings = require('../../utils/settings');


/**
 * Request withdraw
 */
router.post('/add', verifyToken(true), async function (req, res) {
   console.log('----')
   console.log('----')
   console.log('----')
   console.log('adddd')
   res.send('ok')
//    console.log()
   console.log('----')
   console.log('----')
   console.log('----')
});

module.exports = router;
