const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate} = require('../utils');

// Instantiate the Device Model
const eventController = require('../../controllers/event');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader, multiUploader} = require('../../utils/fileManager');
const {verifyTokenPanel} = require('../../utils/validation');

const locationSchema = Joi.object().keys({
    coordinates: JoiConfigs.arrayLength(2,2, JoiConfigs.number)
});

const addSchema = Joi.object().keys({
    title_ar:           JoiConfigs.title,
    title_en:           JoiConfigs.title,
    desc_en:            JoiConfigs.description(),
    desc_ar:            JoiConfigs.description(),
    value:              JoiConfigs.price,
    attendance:         JoiConfigs.number,
    from:               JoiConfigs.timeStamp,
    to:                 JoiConfigs.timeStamp,
    allowedApplyTime:   JoiConfigs.timeStamp,
    area:               JoiConfigs.isMongoId,
    address_ar:         JoiConfigs.description(),
    address_en:         JoiConfigs.description(),
    location:           Joi.any(),
    interests:          JoiConfigs.arrayLength(1,100, JoiConfigs.isMongoId),
});

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
router.post('/add', uploader, joiValidate(addSchema), verifyTokenPanel(), async (req, res) => {
    console.info('API: Add event/init %j', {body: req.body});

    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    req.body.images = [{url: req._uploadPath + '/' + req._uploadFilename, order: 1}];
    eventController.add(req.body)
        .then(event => {
            new NZ.Response(true, 'Event add successful!').send(res);
        })
        .catch(err => {
            console.error("Event Add Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
});

/**
 * Get Event
 * @return Events
 */
//______________________Get Event_____________________//
router.get('/', verifyTokenPanel(), async (req, res) => {
    console.info('API: Get event/init %j', {body: req.body});

    eventController.getAll({})
        .then(events => {
            new NZ.Response({items: events}).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
});


module.exports = router;
