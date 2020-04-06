const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const Joi = require('@hapi/joi');

// Instantiate the Device Model
const interestController = require('../../controllers/interest');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');

/**
 *  Add Interest
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add Interest_____________________//
router.put('/add', uploader, async (req, res) => {
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
            res.err(err)
        })
});

/**
 * Get Interest
 * @return list of interest
 */
//______________________Get Interest_____________________//
router.get('/', function (req, res) {
    console.info('API: Get interest/init');

    interestController.get({lang: req.headers['lang'] ? req.headers['lang'] : 'en'})
        .then(result => {
            console.info("*** interest List : %j", result);
            new NZ.Response({
                items:  result,
            }).send(res);
        })
        .catch(err => {
            console.error("Interest Get Catch err:", err)
            // res.err(err)
        })
});

/**
 * Set Interest
 * @return list of interest
 */
//______________________Set Interest_____________________//
router.post('/', function (req, res) {
    console.info('API: Set interest/init body:', req.body);
    console.info('API: Set interest/init deviceId:', req.deviceId);
    console.info('API: Set interest/init userId:', req.userId);
    const updateValue = {interests: req.body.selected};
    if (req.userId) {
        userController.update(req.userId, updateValue)
            .then(result => {
                console.info("***User interest update List : %j", result);
                new NZ.Response({items:  result}).send(res);
            })
            .catch(err => {
                console.error("Set Interest Get Catch err:", err)
                // res.err(err)
            })
    } else {
        deviceController.update(req.deviceId, updateValue)
            .then(result => {
                console.info("***User interest update List : %j", result);
                new NZ.Response({items:  result}).send(res);
            })
            .catch(err => {
                console.error("Set Interest Get Catch err:", err)
                // res.err(err)
            })
    }


});

module.exports = router;
