const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');

// Instantiate the Device Model
const interestController = require('../../controllers/interest');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/validation');

/**
 *  Add Interest
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add Interest_____________________//
router.put('/add', verifyToken(true), uploader, async (req, res) => {
    console.info('API: Add interest/init %j', {body: req.body});
    if (! req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }
    // const schema = Joi.object().keys({
    //     device:	Joi.object().keys({
    //         name:		Joi.string().required(),
    //         capacity:	Joi.string().regex(/^[0-9.GB]{3,18}$/).required(),
    //         uid:		Joi.string().regex(/^[A-F0-9-]{36}$/).required(),
    //         platform:	Joi.string().required()
    //     }).required(),
    //
    //     os: Joi.object().keys({
    //         version:	Joi.string().required(),
    //         type:		Joi.string().allow('iOS', 'Android').required()
    //     }).required()
    // });
    //
    // result = schema.validate({
    //     device:	req.body.device,
    //     os:		req.body.os
    // });
    //
    // let response = {};
    //
    // if (result.error)
    //     return new NZ.Response(result.error, 'input error.', 400).send(res);

    req.body.image = req._uploadPath+'/'+req._uploadFilename;
    interestController.add(req.body)
        .then(interest => {
            new NZ.Response({item:  interest}).send(res);
        })
        .catch(err => {
            console.error("Interest Add Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
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
router.post('/', verifyToken(), async function (req, res) {

    const setInterestSchema = Joi.object().keys({
        selected: Joi.array().min(1).required()
    });
    let setInterestValidation = setInterestSchema.validate({selected: req.body.selected});
    if (setInterestValidation.error)
        return new NZ.Response(setInterestValidation.error, 'You must choose at least one interest.', 400).send(res);

    //Added
    let lastInterests;
    if (req.userId)
        lastInterests = await userController.get(req.userId, 'id');
    else
        lastInterests = await deviceController.get(req.deviceId, 'id');
    const uniqueInterests = Array.from(new Set([...lastInterests.interests.map(item => item.toString()), ...req.body.selected]));

    //Replace req.body.selected
    const updateValue = {interests: uniqueInterests};


    if (req.userId) {
        userController.update(req.userId, updateValue)
            .then(result => {
                console.info("***User interest update List : %j", result);
                new NZ.Response('', 'Interest has been successfully added!').send(res);
            })
            .catch(err => {
                console.error("Set Interest Get Catch err:", err)
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
