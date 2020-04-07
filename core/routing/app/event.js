const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const Joi = require('@hapi/joi');

// Instantiate the Device Model
// const eventController = require('../../controllers/event');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyToken} = require('../../utils/jwt');

/**
 *  Add Event
 * -upload image and save in req._uploadPath
 * -add Event in db
 * @return status
 */
//______________________Add Event_____________________//
router.put('/add', verifyToken(true), uploader, async (req, res) => {
    console.info('API: Add event/init %j', {body: req.body});
    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }
    // const schema = Joi.object().keys({
    //     device:	Joi.object().keys({
    //         name:		Joi.string().required(),
    //         capacity:	Joi.string().regex(/^[0-9.GB]{3,18}$/).required(),
    //         uid:		Joi.string().regex(/^[A-F0-9-]{36}$/).required(),
    //         platform:	Joi.string().required()
    //     }).required(),
    //
    //     os: Joi.object().keys({
    //         version:	Joi.string().required(),
    //         type:		Joi.string().allow('iOS', 'Android').required()
    //     }).required()
    // });
    //
    // result = schema.validate({
    //     device:	req.body.device,
    //     os:		req.body.os
    // });
    //
    // let response = {};
    //
    // if (result.error)
    //     return new NZ.Response(result.error, 'input error.', 400).send(res);

    // req.body.image = req._uploadPath + '/' + req._uploadFilename;
    // eventController.add(req.body)
    //     .then(event => {
    //         new NZ.Response({item: event}).send(res);
    //     })
    //     .catch(err => {
    //         console.error("Event Add Catch err:", err)
    //         res.err(err)
    //     })
});

/**
 * Get Event
 * @return list of event
 */
//______________________Get Event_____________________//
router.get('/', verifyToken(), async function (req, res) {
    console.info('API: Get event/init');
    new NZ.Response({
        items: [
            {
                title: "Ochello’s catwalk fiesta",
                // desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
                images: [
                    {url: "https://media.crowded.dev.nizek.com/interest/96ToCv/36baa1d8-bf3e-4699-8fdd-ab4bd0933dd4_3SVd6wHgs1.jpg"},
                    // {url: "https://media.crowded.dev.nizek.com/interest/5wTRsy/9520fccd-a305-4c3b-9acb-620b315a6abc_aUzcRNTUn9.jpg"}
                ],
                value: 50.00,
                // Attendance: 60,
                from: Date.now().toString(),
                to: (Date.now()+55).toString(),
                // address: "Kuwait City, Sample St, Famous Alley, NO 13",
                area: "Kuwait City",
            },
            {
                title: "Fashion Event",
                // desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
                images: [
                    {url: "https://media.crowded.dev.nizek.com/interest/GosLsv/8329a57a-1ed7-406a-961f-926c5d0aa955_ovR5bMFxFB.jpg"},
                    // {url: "https://media.crowded.dev.nizek.com/interest/6pT5Tn/e7a7f4ea-c4fa-49ca-9538-8b1ed7da2267__RDeeJG1YQ.jpg"}
                ],
                value: 77.00,
                // Attendance: 95,
                from: Date.now().toString(),
                to: (Date.now()+55).toString(),
                area: "Kuwait City",
                // address: "Kuwait City, Sample St, Famous Alley, NO 13",
            },
        ]
    }).send(res);
});

/**
 * Get Event
 * @return Detail of event
 */
//______________________Get Event_____________________//
router.get('/:id', verifyToken(), async function (req, res) {
    console.info('API: Get detail event/init');
    new NZ.Response({
        items: [
            {
                title: "Ochello’s catwalk fiesta",
                desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
                images: [
                    {url: "https://media.crowded.dev.nizek.com/interest/96ToCv/36baa1d8-bf3e-4699-8fdd-ab4bd0933dd4_3SVd6wHgs1.jpg"},
                    {url: "https://media.crowded.dev.nizek.com/interest/5wTRsy/9520fccd-a305-4c3b-9acb-620b315a6abc_aUzcRNTUn9.jpg"}
                ],
                value: 50.00,
                Attendance: 60,
                from: Date.now().toString(),
                to: (Date.now()+55).toString(),
                address: "Kuwait City, Sample St, Famous Alley, NO 13",
                area: "Kuwait City",
            },

        ]
    }).send(res);
});

/**
 * Set Event
 * @return list of event
 */
//______________________Set Event_____________________//
router.post('/', async function (req, res) {

    const setEventSchema = Joi.object().keys({
        selected: Joi.array().min(1).required()
    });
    let setEventValidation = setEventSchema.validate({selected: req.body.selected});
    if (setEventValidation.error)
        return new NZ.Response(setEventValidation.error, 'input error.', 400).send(res);

    let lastEvents;
    if (req.userId)
        lastEvents = await userController.get(req.userId, 'id');
    else
        lastEvents = await deviceController.get(req.deviceId, 'id');
    const uniqueEvents = Array.from(new Set([...lastEvents.events.map(item => item.toString()), ...req.body.selected]));

    const updateValue = {events: uniqueEvents};


    if (req.userId) {
        userController.update(req.userId, updateValue)
            .then(result => {
                console.info("***User event update List : %j", result);
                new NZ.Response('', 'Event has been successfully added!').send(res);
            })
            .catch(err => {
                console.error("Set Event Get Catch err:", err)
                new NZ.Response(null, err.message, 500).send(res);
            })
    } else {
        deviceController.update(req.deviceId, updateValue)
            .then(result => {
                console.info("***User event update List : %j", result);
                new NZ.Response('', 'Event has been successfully added!').send(res);
            })
            .catch(err => {
                console.error("Set Event Get Catch err:", err)
                new NZ.Response(null, err.message, 500).send(res);
            })
    }


});

module.exports = router;
