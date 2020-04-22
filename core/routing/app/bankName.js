const express = require('express')
    , router = express.Router();

// Utils
const NZ = require('../../utils/nz');

// Grab controller
const bankNameController = require('../../controllers/bankName');
// Instantiate the Device Model
const {verifyToken} = require('../../utils/jwt');

/**
 Get Bank Names
 */
router.get('/', verifyToken(true), async function (req, res) {
    let bankNames = await bankNameController.get({lang:req._lang});
    new NZ.Response(bankNames).send(res);
    // bankNameController.add(prepared);
});



module.exports = router;
