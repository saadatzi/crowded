const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');

// Instantiate the Device Model
const eventController = require('../../controllers/event');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader, multiUploader} = require('../../utils/fileManager');
const {verifyTokenPanel} = require('../../utils/validation');

/**
 *  Add Event Image
 * -upload image callback path&name
 * @return status
 */
//______________________Add Event_____________________//
router.post('/upload', verifyTokenPanel(), uploader, async (req, res) => {
    console.info('API: Add event/init %j', {body: req.body});
    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    const image = req._uploadPath + '/' + req._uploadFilename;
    new NZ.Response({item: image}).send(res);
});

/**
 *  Add Event
 * -upload image and save in req._uploadPath
 * -add Event in db
 * @return status
 */
//______________________Add Event_____________________//
router.post('/add', verifyTokenPanel(), async (req, res) => {
    console.info('API: Add event/init %j', {body: req.body});

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

    eventController.add(req.body)
        .then(event => {
            new NZ.Response({item: event}).send(res);
        })
        .catch(err => {
            console.error("Event Add Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
});


module.exports = router;
