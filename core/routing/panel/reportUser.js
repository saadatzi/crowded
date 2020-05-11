const express = require('express')
    , router = express.Router();

// Utils
const NZ = require('../../utils/nz');
const settings = require('../../utils/settings');

// Validation requirements
const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');

// Grab controller
const reportUserController = require('../../controllers/reportUser');

const {verifyTokenPanel} = require('../../utils/validation');

// Joi validator schemas
const addSchema = Joi.object().keys({
    userId: JoiConfigs.isMongoId,
    eventId: JoiConfigs.isMongoId,
    cause: JoiConfigs.title,
    desc: JoiConfigs.description(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH'),
    status: Joi.string().valid('ACTIVE', 'LEFT', 'PAUSED', 'CONTINUE', 'SUCCESS').required(),
});

/**
 * Get cause options
 * @return array of cause
 */
//______________________Get Leaved Options Event_____________________//
router.get('/causeOption', verifyTokenPanel(), async function (req, res) {
    console.info('API: Report Get cause Options/init');
    new NZ.Response(settings.report.causeOption).send(res);
});

/*
 * Add Report user
 **/
router.post('/add', joiValidate(addSchema), verifyTokenPanel(), async (req, res) => {
    req.body.reporter = req.userId;
    reportUserController.add(req.body)
        .then(result => {
            new NZ.Response(true, 'Your report successfully added!').send(res);
        })
        .catch(err => {
            console.error("Add ReportUser Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        });
});

module.exports = router;
