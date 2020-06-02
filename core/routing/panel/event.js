const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate, grabSettings} = require('../utils');

// Instantiate the Device Model
const eventController = require('../../controllers/event');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader, multiUploader} = require('../../utils/fileManager');
const {verifyTokenPanel, authorization} = require('../../utils/validation');
const settings = require('../../utils/settings');

const UserEvent = require('../../models/UserEvent');

const locationSchema = Joi.object().keys({
    coordinates: JoiConfigs.arrayLength(2, 2, JoiConfigs.number)
});


// Joi valdiator schemas

const hasValidIdSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId
});

const deleteImageSchema = Joi.object().keys({
    eventId: JoiConfigs.isMongoId,
    imageId: JoiConfigs.isMongoId,
});

const addImageSchema = Joi.object().keys({
    eventId: JoiConfigs.isMongoId,
});

const orderImagesSchema = Joi.object().keys({
    eventId: JoiConfigs.isMongoId,
    newOrderImages: JoiConfigs.arrayLength(1, 10, JoiConfigs.isMongoId),
});

const addSchema = Joi.object().keys({
    title_ar: JoiConfigs.title,
    title_en: JoiConfigs.title,
    desc_en: JoiConfigs.description(),
    desc_ar: JoiConfigs.description(),
    value: JoiConfigs.price,
    attendance: JoiConfigs.number,
    from: JoiConfigs.timeStamp,
    to: JoiConfigs.timeStamp,
    allowedApplyTime: JoiConfigs.timeStamp,
    area: JoiConfigs.isMongoId,
    address_ar: JoiConfigs.description(),
    address_en: JoiConfigs.description(),
    lat: JoiConfigs.price,
    lng: JoiConfigs.price,
    interests: JoiConfigs.arrayLength(1, 100, JoiConfigs.isMongoId),
    allowedRadius: Joi.number().integer().min(50).max(2000).required(),
});

const updateSchema = Joi.object().keys({
    eventId: JoiConfigs.isMongoId,
    title_ar: JoiConfigs.title,
    title_en: JoiConfigs.title,
    desc_en: JoiConfigs.description(),
    desc_ar: JoiConfigs.description(),
    value: JoiConfigs.price,
    attendance: JoiConfigs.number,
    from: JoiConfigs.timeStamp,
    to: JoiConfigs.timeStamp,
    allowedApplyTime: JoiConfigs.timeStamp,
    area: JoiConfigs.isMongoId,
    address_ar: JoiConfigs.description(),
    address_en: JoiConfigs.description(),
    lat: JoiConfigs.price,
    lng: JoiConfigs.price,
    interests: JoiConfigs.arrayLength(1, 100, JoiConfigs.isMongoId),
    allowedRadius: JoiConfigs.number,
    // isActive: JoiConfigs.boolInt,
});

const activateSchema = Joi.object().keys({
    eventId: JoiConfigs.isMongoId,
    isActive: JoiConfigs.boolInt,
});


const listSchema = JoiConfigs.schemas.list({
    /* TODO sort in interest or orgId
    * Event / Add Filter: [Status][Organizer][Interests] and Sort: [A/D Date][A/D Status][A/D Organizer][A/D Interests]*/
    filters: {
        status: Joi.number().valid(0, 1).optional(),
        orgId: JoiConfigs.isMongoIdOpt,
        interests: JoiConfigs.array(false, JoiConfigs.isMongoId),
    },
    sorts: {
        status: Joi.number().valid(-1, 1),
        from: Joi.number().valid(-1, 1),
        title_en: Joi.number().valid(-1, 1),
        title_ar: Joi.number().valid(-1, 1),
    },
    defaultSorts: {
        status: 1,
        from: 1
    }
});


/**
 *  Add Event Image
 * -upload image callback path&name
 * @return status
 */
//______________________Add Event_____________________//
router.post('/addImage', verifyTokenPanel(), uploader, joiValidate(addImageSchema), authorization([{EVENT: 'RU'}]), async (req, res) => {
    console.info('API: addImage event/init %j', {body: req.body});
    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    eventController.get(req.body.eventId)
        .then(event => {
            if (event.images.length + 1 > settings.event.maxImageForEvent) return new NZ.Response(false, `${settings.event.maxImageForEvent} images are allowed for the event.`, 400).send(res);
            event.images.push({url: req._uploadPath + '/' + req._uploadFilename, order: null});
            event.save();
            new NZ.Response(true, 'Event add image successful!').send(res);
        })
        .catch(err => {
            console.error("Event Add Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Reorder Images Update Event
 * -add Event in db
 * @return status
 */
//______________________Reorder Images Event_____________________//
router.put('/reorder', joiValidate(orderImagesSchema), verifyTokenPanel(), authorization([{EVENT: 'RU'}]), async (req, res) => {
    console.info('API: Reorder Images event/init %j', {body: req.body});


    eventController.reorder(req.body.eventId, req.body.newOrderImages)
        .then(event => {
            new NZ.Response(!!event, event ? 'Reorder images Update successful!' : 'Not Found!').send(res);
        })
        .catch(err => {
            console.error("Event Reorder Images Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 *  Remove Event Image
 * - image pull
 * @return status
 */
//______________________Add Event_____________________//
router.delete('/image', joiValidate(deleteImageSchema), verifyTokenPanel(), authorization([{EVENT: 'RU'}]), async (req, res) => {
    console.info('API: DelImage event/init %j', {body: req.body});
    eventController.removeImage(req.body.eventId, req.body.imageId)
        .then(event => {
            new NZ.Response(true, 'Event delete image successfully!').send(res);
        })
        .catch(err => {
            console.error("Event delete Image Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Add Event
 * -upload image and save in req._uploadPath
 * -add Event in db
 * @return status
 */
//______________________Add Event_____________________//
router.post('/add', verifyTokenPanel(), uploader, joiValidate(addSchema), authorization([{EVENT: 'C'}]), async (req, res) => {
    console.info('API: Add event/init %j', {body: req.body});

    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    req.body.imagePicker = req._uploadPath + '/' + req._uploadFilename;
    req.body.location = {coordinates: [req.body.lat, req.body.lng]};
    req.body.owner = req.userId;
    req.body.orgId = req._admin.organizationId;
    eventController.add(req.body)
        .then(event => {
            new NZ.Response({id: event._id}, 'Event add successful!').send(res);
        })
        .catch(err => {
            console.error("Event Add Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Add Event ImagePicker
 * -upload image callback path&name
 * @return status
 */
//______________________Add Event ImagePicker_____________________//
router.post('/changeImagePicker', verifyTokenPanel(), uploader, joiValidate(addImageSchema), authorization([{EVENT: 'RU'}]), async (req, res) => {
    console.info('API: changeImagePicker event/init %j', {body: req.body});
    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    eventController.update(req.body.eventId, {imagePicker: req._uploadPath + '/' + req._uploadFilename})
        .then(event => {
            new NZ.Response(!!event, event ? 'Event change image picker successful!' : 'not found!', event ? 200 : 404).send(res);
        })
        .catch(err => {
            console.error("Event changeImagePicker Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Update Event
 * -add Event in db
 * @return status
 */
//______________________Add Event_____________________//
router.put('/edit', joiValidate(updateSchema), verifyTokenPanel(), authorization([{EVENT: 'RU'}]), async (req, res) => {
    console.info('API: Add event/init %j', {body: req.body});


    const eventId = req.body.eventId;
    delete req.body.eventId;
    req.body.location = {type: 'Point', coordinates: [req.body.lat, req.body.lng]};
    eventController.update(eventId, req.body)
        .then(event => {
            new NZ.Response(!!event, event ? 'Event Update successful!' : 'Not Found!').send(res);
        })
        .catch(err => {
            console.error("Event Update Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Activation Event
 * -add Event in db
 * @return status
 */
//______________________Add Event_____________________//
router.put('/activate', joiValidate(activateSchema), verifyTokenPanel(), authorization([{EVENT: 'RU'}]), async (req, res) => {
    console.info('API: Activation event/init %j', {body: req.body});
    if (req.auth.accessLevel.EVENT[1].U.level !== 'ANY') return new NZ.Response(null, 'You are not allowed to activate the event!', 403).send(res);
    eventController.update(req.body.eventId, {status: req.body.isActive})
        .then(event => {
            const resultMessage = req.body.isActive ? 'Event Activation successful!' : 'Event Deactivation successful!';
            new NZ.Response(!!event, event ? resultMessage : 'Not Found!', event ? 200 : 404).send(res);
        })
        .catch(err => {
            console.error("Event Update Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 * Get Event List
 * @return Events
 */
//______________________Get Event_____________________//
//TODO JOI Validation
router.post('/', grabSettings(), joiValidate(listSchema), verifyTokenPanel(), authorization([{EVENT: 'R'}]), async (req, res) => {
    console.info('API: Get event/init %j', {body: req.body});

    eventController.list(req.userId, req._body, req.auth.accessLevel.EVENT[0].R.level)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 * Remove Event
 */
router.delete('/', verifyTokenPanel(), joiValidate(hasValidIdSchema), authorization([{EVENT: 'RD'}]), async (req, res) => {

    let id = req.body.id;

    // await check UserEvent relation
    //TODO s.mahdi: best practice only controller depend to Model
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


/**
 * Get Event Detail
 */
router.get('/:id', verifyTokenPanel(), authorization([{EVENT: 'R'}]), async (req, res) => {
    console.info('API: Get event Detail/init ', req.params);
    let options = {
        _id: req.params.id
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

module.exports = router;
