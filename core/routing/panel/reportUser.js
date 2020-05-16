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
const userEventController = require('../../controllers/userEvent');

const {verifyTokenPanel, authorization} = require('../../utils/validation');

// Joi validator schemas
const addSchema = Joi.object().keys({
    userId: JoiConfigs.isMongoId,
    eventId: JoiConfigs.isMongoId,
    cause: JoiConfigs.strValid(settings.report.causeOption),//Joi.string().valid(...settings.report.causeOption).required(),
    desc: JoiConfigs.description(false),
    priority: JoiConfigs.strValid(['LOW', 'MEDIUM', 'HIGH'], false),//Joi.string().valid(),
    status: JoiConfigs.strValid(['ACTIVE', 'LEFT', 'PAUSED', 'CONTINUE', 'SUCCESS']),// Joi.string().valid().required(),
});

const hasValidIdSchema = Joi.object().keys({
    reportId: JoiConfigs.isMongoId
});


const listSchema = JoiConfigs.schemas.list({
    filters:{
        userId: JoiConfigs.isMongoIdOpt,
        priority: JoiConfigs.strValid(['LOW', 'MEDIUM', 'HIGH'], false)
    },
    sorts:{
        createdAt: Joi.number().valid(-1,1),
        cause: Joi.number().valid(-1,1),
        priority: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        createdAt: -1,
    }
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
router.post('/add', joiValidate(addSchema), verifyTokenPanel(), authorization([{REPORT: 'C'}]), async (req, res) => {
    //check is valid userId&eventId
    userEventController.isValidUserEventReport(req.body.userId, req.body.eventId, ['ACTIVE', 'LEFT', 'PAUSED', 'CONTINUE', 'SUCCESS'])
        .then(result => {
            if (!result) return new NZ.Response(false, 'It is not possible to register a report for a user who did not participate in the event!', 400).send(res);
            req.body.reporterId = req.userId;
            reportUserController.add(req.body)
                .then(result => {
                    new NZ.Response(true, 'Your report successfully added!').send(res);
                })
                .catch(err => {
                    console.error("Add ReportUser Catch err:", err);
                    new NZ.Response(null, err.message, err.code || 500).send(res);
                });
        })
        .catch(err => {
            console.error("Add ReportUser Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        });
});


/**
 * Get Reports user
 * @return list of Report
 */
router.post('/', joiValidate(listSchema), verifyTokenPanel(), authorization([{REPORT: 'R'}]), async function (req, res) {
    // !! NOTE that joi-filtered data is now in req._body not req.body !!
    reportUserController.getManyPanel(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });

});



/**
 * Remove Report
 */
router.delete('/:reportId', joiValidate(hasValidIdSchema, 2), verifyTokenPanel(), authorization([{REPORT: 'RD'}]), async (req, res) => {

    reportUserController.remove(req.params.reportId)
        .then(result => {
            new NZ.Response(null, "Report removed successfully.").send(res);
        })
        .catch(err => {
            console.error("Remove Report Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        });

});


module.exports = router;
