const express = require('express')
    , router = express.Router();


const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate} = require('../utils');

// Instantiate the Device Model
const interestController = require('../../controllers/interest');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/validation');



const setSchema = Joi.object().keys({
    selected: JoiConfigs.arrayLength(1, 200, JoiConfigs.isMongoId),
});


/**
 * Get Interest
 * @return list of interest
 */
//______________________Get Interest_____________________//
router.get('/', verifyToken(), async function (req, res) {
    console.info('API: Get interest/init');
    let selected;
    if (req.userId) {
        selected = await userController.get(req.userId, 'id');
    } else {
        selected = await deviceController.get(req.deviceId, 'id');
    }
    interestController.get({selected: selected.interests || [], lang: req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en'})
        .then(result => {
            console.info("*** interest List : %j", result);
            new NZ.Response({items:  result,}).send(res);
        })
        .catch(err => {
            console.error("Interest Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
});

/**
 * Set Interest
 * @return list of interest
 */
//______________________Set Interest_____________________//
router.post('/', joiValidate(setSchema),  verifyToken(), async function (req, res) {
    console.info('API: Set interest/init %j', {body: req.body});

    //TODO when must to merge?!
    //Added 'You must choose at least one interest.'
    // let lastInterests;
    // if (req.userId)
    //     lastInterests = await userController.get(req.userId, 'interest');
    // else
    //     lastInterests = await deviceController.get(req.deviceId, 'id');
    // const uniqueInterests = Array.from(new Set([...lastInterests.interests.map(item => item.toString()), ...req.body.selected]));
    // console.info('API: Set interest/lastInterests %j', lastInterests);
    // console.info('API: Set interest/uniqueInterests %j', uniqueInterests);
    //Replace req.body.selected
    const updateValue = {interests: req.body.selected};


    if (req.userId) {
        userController.update(req.userId, updateValue)
            .then(result => {
                console.info("***User interest update List : %j", result);
                new NZ.Response('', 'Interest has been successfully added!').send(res);
            })
            .catch(err => {
                console.error("Set Interest Get Catch err:", err);
                new NZ.Response(null, err.message, 500).send(res);
            })
    } else {
        deviceController.update(req.deviceId, updateValue)
            .then(result => {
                console.info("***User interest update List : %j", result);
                new NZ.Response('', 'Interest has been successfully added!').send(res);
            })
            .catch(err => {
                console.error("Set Interest Get Catch err:", err)
                new NZ.Response(null, err.message, 500).send(res);
            })
    }


});

module.exports = router;
