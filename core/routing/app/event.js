const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const Joi = require('@hapi/joi');

// Instantiate the Device Model
const eventController = require('../../controllers/event');
const userEventController = require('../../controllers/userEvent');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/jwt');
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
    if (selected.interests.length > 0) criteria.interests = {$in: selected.interests};

    const page = req.query.page ? Number(req.query.page) : 0;
    const optionFilter = {
        criteria,
        page,
        lang: req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en'
    };
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
router.post('/', verifyToken(true),async function (req, res) {
    const applyEventSchema = Joi.object().keys({
        eventId: Joi.string().length(24).required(),
    });
    let applyEventValidation = applyEventSchema.validate({eventId: req.body.eventId});
    if (applyEventValidation.error)
        return new NZ.Response(applyEventValidation.error, 'input error.', 400).send(res);

    userEventController.add(req.body.eventId, req.userId)
        .then(result => {
            new NZ.Response({status: result.status}).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
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
