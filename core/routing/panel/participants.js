const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate} = require('../utils');

const settings = require('../../utils/settings')

// Instantiate the Device Model
const userEventController = require('../../controllers/userEvent');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel, authorization} = require('../../utils/validation');
const {sendNotification} = require('../../utils/call');


// Joi validator schemas
const manageSchema = Joi.object().keys({
    userId: JoiConfigs.isMongoId,
    eventId: JoiConfigs.isMongoId,
    isApproved: JoiConfigs.booleanVal
});

/**
 * Get Event Participants
 * @return Users
 */
//______________________Get Participants Event_____________________//
router.post('/', verifyTokenPanel(), authorization([{EVENT: 'R'}, {PARTICIPANTS: 'R'}]), async (req, res) => {
    console.info('API: Get Participants event/init %j', {body: req.body});

    userController.getParticipants(req._admin, req.body, req.auth)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Get Participants Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 * Set Event Participants
 * @return Boolean
 */
//______________________Set Participants Event_____________________//
router.post('/manage', joiValidate(manageSchema), verifyTokenPanel(), authorization([{EVENT: 'R'}, {PARTICIPANTS: 'RU'}]), async (req, res) => {
    console.info('API: Get Participants event/init %j', {body: req.body});

    userEventController.manageParticipant(req._admin, req.body, req.auth)
        .then(event => {
            if (req.body.isApproved) {
                deviceController.getNotificationId(req.body.userId)
                    .then(notificationId => {
                        const message = settings.notification(event).approval;

                        sendNotification(`event/${event._id}`, [notificationId], message.title, message.desc, settings.media_domain + event.imagePicker)
                    })
                    .catch(err => {
                        console.error("manage Participants sendNotification get User Catch:", err);
                    });
            }
            new NZ.Response(true, 'Your request has been successfully submitted').send(res);
        })
        .catch(err => {
            console.error("manage Participants Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
