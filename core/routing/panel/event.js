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
const {verifyTokenPanel, authorization} = require('../../utils/validation');

const UserEvent = require('../../models/UserEvent');

const locationSchema = Joi.object().keys({
    coordinates: JoiConfigs.arrayLength(2,2, JoiConfigs.number)
});


// Joi valdiator schemas

const hasValidIdSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId
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
    lat:                JoiConfigs.price,
    lng:                JoiConfigs.price,
    interests:          JoiConfigs.arrayLength(1,100, JoiConfigs.isMongoId),
});

const updateSchema = Joi.object().keys({
    eventId:            JoiConfigs.isMongoId,
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
    lat:                JoiConfigs.price,
    lng:                JoiConfigs.price,
    interests:          JoiConfigs.arrayLength(1,100, JoiConfigs.isMongoId),
});

/**
 *  Add Event Image
 * -upload image callback path&name
 * @return status
 */
//______________________Add Event_____________________//
router.post('/addImage', verifyTokenPanel(), uploader, async (req, res) => {
    console.info('API: addImage event/init %j', {body: req.body});
    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    eventController.get(req.body.eventId)
        .then(event => {
            event.images.push({url: req._uploadPath + '/' + req._uploadFilename, order: null});
            event.save();
            new NZ.Response(true, 'Event add image successful!').send(res);
        })
        .catch(err => {
            console.error("Event Add Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
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
    req.body.location = {coordinates: [req.body.lat,req.body.lng]};
    req.body.owner = req.userId;
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
 *  Update Event
 * -upload image and save in req._uploadPath
 * -add Event in db
 * @return status
 */
//______________________Add Event_____________________//
router.put('/edit', joiValidate(updateSchema), verifyTokenPanel(), async (req, res) => {
    console.info('API: Add event/init %j', {body: req.body});


    const eventId = req.body.eventId;
    delete req.body.eventId;
    eventController.update(eventId, req.body)
        .then(event => {
            new NZ.Response(!!event, event ? 'Event Update successful!' : 'Not Found!').send(res);
        })
        .catch(err => {
            console.error("Event Update Catch err:", err);
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
});

/**
 * Get Event
 * @return Events
 */
//______________________Get Event_____________________//
router.get('/', verifyTokenPanel(), authorization([{EVENT:'r'}]),  async (req, res) => {
    console.info('API: Get event/init %j', {body: req.body});

    eventController.getAll(req.userId, req.accessGroup, req.accessAny)
        .then(events => {
            new NZ.Response({items: events}).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
});


/**
 * Get Event Detail
 */
router.get('/:id', verifyTokenPanel(), async (req, res) => {
    console.info('API: Get event Detail/init ', req.params);
    let options = {
        _id:req.params.id
    };
    eventController.getOnePanel(options)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error('API: Get event Detail catch ', err);
            new NZ.Response(null, err.message, 500).send(res);
        });

});


/**
 * Remove Interest
 */
router.delete('/', verifyTokenPanel(), joiValidate(hasValidIdSchema, 0), async (req, res) => {

    let id = req.body.id;

    // await check UserEvent relation 
    let flag = await UserEvent.eventIsRelated(id);

    if (flag) {
        return new NZ.Response(null, "Couldn`t remove the event due to its usage by the users.", 400).send(res);
    } else {
        eventController.remove(id)
            .then(result => {
                new NZ.Response(null, "Event removed successfully.").send(res);
            })
            .catch(err => {
                new NZ.Response(null, err.message, 500).send(res);
            });
    }

});



module.exports = router;
