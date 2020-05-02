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
    coordinates: JoiConfigs.arrayLength(2, 2, JoiConfigs.number)
});


// Joi valdiator schemas


/**
 * Get Event Participants
 * @return Users
 */
//______________________Get Participants Event_____________________//
router.post('/', verifyTokenPanel(), authorization([{EVENT: 'R'}, {USER: 'R'}, {MANAGE_PARTICIPANTS: 'R'}]), async (req, res) => {
    console.info('API: Get Participants event/init %j', {body: req.body});

    userController.getParticipants(req.admin, req.body, req.auth)
        .then(items => {
            new NZ.Response({items}).send(res);
        })
        .catch(err => {
            console.error("Get Participants Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
