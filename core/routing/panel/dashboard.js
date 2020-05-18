const express = require('express')
    , router = express.Router();

const moment = require('moment-timezone');


// Instantiate the Device Model
const NZ = require('../../utils/nz');
const {verifyTokenPanel, authorization} = require('../../utils/validation');

// Controllers
const dashboardController = require('../../controllers/dashboard');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');

const settings = require('../../utils/settings');


const getStatsSchema = Joi.object().keys({
    today: Joi.boolean(),
    allTime: Joi.boolean(),
    month: Joi.object().keys({date: JoiConfigs.timeStamp}),
    year: Joi.object().keys({date: JoiConfigs.timeStamp}),
    // from: Joi.string().default(() => {
    //     return moment.unix(Date.now()).startOf('month').toDate()
    // }),
    // to: Joi.string().default(() => {
    //     return moment.unix(Date.now()).endOf('month').toDate()
    // })
}).min(0).max(1);

const calendarFiltersSchema = Joi.object().keys({
    monthFlag: Joi.string(),
});


/**
 *  Get everything
 */
router.post('/', joiValidate(getStatsSchema), verifyTokenPanel(), authorization([{EVENT: 'R'}, {TRANSACTION: 'R'}]), async (req, res) => {
    console.info('API: Dashboard getStats/init %j', {body: req._body});

    //TODO why try catch, controller is promise
    try {
        let stats = await dashboardController.getStats(req._admin, req._body, req.auth.accessLevel);
        new NZ.Response(stats).send(res);
    } catch (err) {
        new NZ.Response(err.message, err.code).send(res);
    }

});

/**
 * Get calendar data
 */
router.post('/calendar', verifyTokenPanel(), joiValidate(calendarFiltersSchema, 0), authorization([{EVENT: 'R'}]), async (req, res) => {
    console.info('API: Dashboard calendar/init %j', {body: req._body});

    // normalize
    let monthFlag = new Date(req._body.monthFlag / 1);

    //TODO why try catch, controller is promise
    try {
        let calendar = await dashboardController.getCalendar(req.userId, monthFlag, req.auth.accessLevel);
        new NZ.Response({items:calendar}).send(res);
    } catch (err) {
        new NZ.Response(err.message, err.code).send(res);
    }

});


module.exports = router;
