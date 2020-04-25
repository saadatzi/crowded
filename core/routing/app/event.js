const express = require('express')
    , router = express.Router();
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

// Instantiate the Device Model
const eventController = require('../../controllers/event');
const userEventController = require('../../controllers/userEvent');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/validation');
const settings = require('../../utils/settings');


/**
 * Get Event
 * @param @optional page
 * @param @optional lat
 * @param @optional lon
 * @return list of event
 */
//______________________Get Event_____________________//
router.get('/', verifyToken(), async function (req, res) {
    console.info('API: Get event/init req.query', req.query);
    let selected;
    if (req.userId) {
        selected = await userController.get(req.userId, 'id');
    } else {
        selected = await deviceController.get(req.deviceId, 'id');
    }
    const criteria = {};
    //if empty interests select all Event
    if (selected.interests && selected.interests.length > 0) criteria.interests = {$in: selected.interests};

    const page = req.query.page ? Number(req.query.page) : 0;
    const optionFilter = {
        criteria,
        page,
        lang: req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en'
    };
    if (req.query.lat && req.query.lng) {
        optionFilter.lat = Number(req.query.lat);
        optionFilter.lng = Number(req.query.lng);
    }
    eventController.get(optionFilter)
        .then(result => {
            console.info("*** Event List.length :", result.length);
            // console.info("*** Event List: ", result);
            let nextPage = null;
            if (result.length > settings.event.limitPage) {
                nextPage = page + 1;
                const x = result.pop();
                // console.log(">>>>>>>>>>>>>>> x.pop:", x);
            }
            new NZ.Response({items: result, nextPage,}).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
});

/**
 * Apply Event
 * @return list of event
 */
//______________________Apply Event_____________________//
router.post('/', verifyToken(true), async function (req, res) {
    const applyEventSchema = Joi.object().keys({
        eventId: Joi.string().length(24).required(),
    });
    let applyEventValidation = applyEventSchema.validate({eventId: req.body.eventId});
    if (applyEventValidation.error)
        return new NZ.Response(applyEventValidation.error, 'input error.', 400).send(res);

    userEventController.add(req.body.eventId, req.userId)
        .then(result => {
            //TODO set automatic Approved for Test
            console.info(">>>>>>>>>>>>>>>>>>>>>***30sec Set Status APPROVED : %j", result);
            result.status = "APPROVED";
            result.save();
            new NZ.Response({status: result.status}).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })

});

/**
 * Get current Event
 * @return Detail of event
 */
//______________________Get current Event_____________________//
router.get('/current', verifyToken(true), async function (req, res) {
    console.info('API: Get current event/init');
    userEventController.getCurrent(req.userId, req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en')
        .then(event => {
            console.info("*** UserEvent current : %j", event);
            new NZ.Response(event, event ? null : 'There is no active event!').send(res);
        })
        .catch(err => {
            console.error("Event current Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * set status event
 */
//______________________Set Status Event_____________________//
router.post('/status', verifyToken(true), async function (req, res) {
    console.info('API: Set Status event/init');
    new NZ.Response(null, 'Disable method!', 405).send(res);
    //TODO JOE validation
    /*const setStatusJoi = Joi.object().keys({
        eventId: Joi.string().length(24).required(),
        status: Joi.string().valid('APPROVED', 'REJECTED', 'ACTIVE', 'LEFT', 'PAUSED', 'SUCCESS').required()
    });
    let setStatusValidation = setStatusJoi.validate(req.body);
    if (setStatusValidation.error)
        return new NZ.Response(setStatusValidation.error, 'input error.', 400).send(res);

    userEventController.setStatus(req.userId, req.body.eventId, req.body.status)
        .then(event => {
            console.info("*** Set Status : %j", event);
            new NZ.Response(null, event ? req.body.status : 'Not found!').send(res);
        })
        .catch(err => {
            console.error("Event Set Status Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })*/
});

/**
 * set Active event
 */
//______________________Set Active Event_____________________//
router.post('/active', verifyToken(true), async function (req, res) {
    console.info('API: Set Active event/init', req.body);
    if (!mongoose.Types.ObjectId.isValid(req.body.eventId)) {
        return new NZ.Response({title: 'input error', message: 'eventId must be a valid id'}, 'input error.', 400).send(res);
    }

    userEventController.setStatus(req.userId, req.body.eventId, 'ACTIVE')
        .then(userEvent => {
            console.info("*** Set Status : %j", userEvent);
            new NZ.Response(null, 'Active').send(res);
        })
        .catch(err => {
            console.error("Event Set Active Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * set PAUSED event
 */
//______________________Set PAUSED Event_____________________//
router.post('/pause', verifyToken(true), async function (req, res) {
    console.info('API: Set PAUSED event/init', req.body);
    if (!mongoose.Types.ObjectId.isValid(req.body.eventId)) {
        return new NZ.Response({
            title: 'input error',
            message: 'eventId must be a valid id'
        }, 'input error.', 400).send(res);
    }

    userEventController.setStatus(req.userId, req.body.eventId, 'PAUSED')
        .then(event => {
            console.info("*** Set Status : %j", event);
            new NZ.Response(null, 'PAUSED').send(res);
        })
        .catch(err => {
            console.error("Event Set PAUSED Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 * set CONTINUE event
 */
//______________________Set CONTINUE Event_____________________//
router.post('/continue', verifyToken(true), async function (req, res) {
    console.info('API: Set CONTINUE event/init', req.body);
    if (!mongoose.Types.ObjectId.isValid(req.body.eventId)) {
        return new NZ.Response({
            title: 'input error',
            message: 'eventId must be a valid id'
        }, 'input error.', 400).send(res);
    }

    //TODO like Active..... can Pause
    userEventController.setStatus(req.userId, req.body.eventId, 'CONTINUE')
        .then(event => {
            console.info("*** Set Status : %j", event);
            new NZ.Response(null, 'CONTINUE').send(res);
        })
        .catch(err => {
            console.error("Event Set CONTINUE Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * set LEFT event
 */
//______________________Set LEFT Event_____________________//
router.post('/left', verifyToken(true), async function (req, res) {
    console.info('API: Set LEFT event/init', req.body);
    if (!mongoose.Types.ObjectId.isValid(req.body.eventId)) {
        return new NZ.Response({
            title: 'input error',
            message: 'eventId must be a valid id'
        }, 'input error.', 400).send(res);
    }

    userEventController.setStatus(req.userId, req.body.eventId, 'LEFT')
        .then(event => {
            console.info("*** Set Status : %j", event);
            new NZ.Response(null, 'LEFT').send(res);
        })
        .catch(err => {
            console.error("Event Set LEFT Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * set Elapsed event
 */
//______________________Set Elapsed Event_____________________//
router.post('/elapsed', verifyToken(true), async function (req, res) {
    console.info('API: Set Elapsed event/init', req.body);
    if (!mongoose.Types.ObjectId.isValid(req.body.eventId)) {
        return new NZ.Response({
            title: 'input error',
            message: 'eventId must be a valid id'
        }, 'input error.', 400).send(res);
    }

    //TODO JOE validation
    const elapsedJoi = Joi.object().keys({
        eventId: Joi.string().length(24).required(),
        elapsed: Joi.number().required(),
        coordinates: Joi.array().length(2).items(Joi.number().required(), Joi.number().required()).optional(),
        isFinished: Joi.boolean().required(),
    });
    let elapsedJoiValidation = elapsedJoi.validate(req.body);
    if (elapsedJoiValidation.error)
        return new NZ.Response(elapsedJoiValidation.error, 'input error.', 400).send(res);

    userEventController.addElapsed(req.userId, req.body.eventId, req.body.elapsed, req.body.coordinates, String(req.body.isFinished).toBoolean())
        .then(event => {
            console.info("*** Set Status : %j", event);
            new NZ.Response(null, 'Add attendance').send(res);
        })
        .catch(err => {
            console.error("Event Set Elapsed Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * set left feedback
 */
//______________________Set leftFeedback Event_____________________//
router.post('/leftFeedback', verifyToken(true), async function (req, res) {
    // const validOption = settings.event.leftOption.join().toString();
    console.info('API: Set leftFeedback event/init');
    //TODO JOE validation
    const setStatusJoi = Joi.object().keys({
        eventId: Joi.string().length(24).required(),
        title: Joi.string().required(),
        desc: Joi.string().optional(),
    });
    let setStatusValidation = setStatusJoi.validate(req.body);
    if (setStatusValidation.error)
        return new NZ.Response(setStatusValidation.error, 'input error.', 400).send(res);

    const updateLeftValue = {
        feedbackDesc: req.body.desc,
        feedbackTitle: req.body.title,
    }

    userEventController.setStatus(req.userId, req.body.eventId, 'LEFT', updateLeftValue)
        .then(event => {
            console.info("*** Set leftFeedback  : %j", event);
            new NZ.Response(null, 'LEFT').send(res);
        })
        .catch(err => {
            console.error("Event Set leftFeedback Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * set success feedback
 */
//______________________Set successFeedback Event_____________________//
router.post('/feedback', verifyToken(true), async function (req, res) {
    console.info('API: Set successFeedback event/init');
    //TODO JOE validation
    const setStatusJoi = Joi.object().keys({
        eventId: Joi.string().length(24).required(),
        star: Joi.number().optional(),
        desc: Joi.string().optional(),
    });
    let setStatusValidation = setStatusJoi.validate(req.body);
    if (setStatusValidation.error)
        return new NZ.Response(setStatusValidation.error, 'input error.', 400).send(res);

    const updateSuccessValue = {
        feedbackDesc: req.body.desc,
        star: Number(req.body.star),
    }
    userEventController.setStatus(req.userId, req.body.eventId, 'SUCCESS', updateSuccessValue)
        .then(event => {
            console.info("*** Set successFeedback  : %j", event);
            new NZ.Response(null, 'SUCCESS').send(res);
        })
        .catch(err => {
            console.error("Event Set successFeedback Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Get Leaved options
 * @return Detail of event
 */
//______________________Get Leaved Options Event_____________________//
router.get('/leftOption', verifyToken(true), async function (req, res) {
    console.info('API: Get Leaved Options event/init');
    new NZ.Response(settings.event.leftOption).send(res);
});


/**
 * Get myEvent
 * @param @optional page
 * @param @optional lat
 * @param @optional lon
 * @return list of event
 */
//______________________Get Event_____________________//
router.get('/myEvent', verifyToken(true), async function (req, res) {
    console.info('API: Get myEvent event/init req.query', req.query);

    eventController.getMyEvent(req.userId, req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en', req.query.page, req.query.previous, req.query.date)
        .then(result => {
            let nextPage = null;
            if (result.length > settings.event.limitPage) {
                nextPage = Number(req.query.page) + 1;
                const x = result.pop();
                // console.log(">>>>>>>>>>>>>>> x.pop:", x);
            }
            new NZ.Response({items: result, nextPage}).send(res);
        })
        .catch(err => {
            console.error("Event Get myEvent Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
});

/**
 * Get Event
 * @return Detail of event
 */
//______________________Get Event_____________________//
router.get('/:id', verifyToken(), async function (req, res) {
    console.info('API: Get detail event/init');
    eventController.getByIdAggregate(req.params.id, req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en', req.userId)
        .then(event => {
            console.info("*** Event By Id : %j", event);
            new NZ.Response(event).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
});


module.exports = router;
