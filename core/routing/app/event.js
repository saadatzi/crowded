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
    // new NZ.Response({
    //     items: [
    //         {
    //             id: "123",
    //             title: "Ochello’s catwalk fiesta",
    //             // desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
    //             image: {url: "https://media.crowded.dev.nizek.com/interest/96ToCv/36baa1d8-bf3e-4699-8fdd-ab4bd0933dd4_3SVd6wHgs1.jpg"},
    //                 // {url: "https://media.crowded.dev.nizek.com/interest/5wTRsy/9520fccd-a305-4c3b-9acb-620b315a6abc_aUzcRNTUn9.jpg"},
    //             value: 50.00,
    //             // Attendance: 60,
    //             from: Date.now().toString(),
    //             to: (Date.now()+55).toString(),
    //             // address: "Kuwait City, Sample St, Famous Alley, NO 13",
    //             area: "Kuwait City",
    //         },
    //         {
    //             id: "1234",
    //             title: "Fashion Event",
    //             // desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
    //             image: {url: "https://media.crowded.dev.nizek.com/interest/GosLsv/8329a57a-1ed7-406a-961f-926c5d0aa955_ovR5bMFxFB.jpg"},
    //                 // {url: "https://media.crowded.dev.nizek.com/interest/6pT5Tn/e7a7f4ea-c4fa-49ca-9538-8b1ed7da2267__RDeeJG1YQ.jpg"}
    //             value: 77.00,
    //             // Attendance: 95,
    //             from: Date.now().toString(),
    //             to: (Date.now()+55).toString(),
    //             area: "Kuwait City",
    //             // address: "Kuwait City, Sample St, Famous Alley, NO 13",
    //         },
    //         {
    //             id: "1237",
    //             title: "Sport Event",
    //             // desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
    //             image: {url: "https://media.crowded.dev.nizek.com/interest/6pT5Tn/e7a7f4ea-c4fa-49ca-9538-8b1ed7da2267__RDeeJG1YQ.jpg"},
    //             // {url: "https://media.crowded.dev.nizek.com/interest/6pT5Tn/e7a7f4ea-c4fa-49ca-9538-8b1ed7da2267__RDeeJG1YQ.jpg"}
    //             value: 145.50,
    //             // Attendance: 95,
    //             from: Date.now().toString(),
    //             to: (Date.now()+55).toString(),
    //             area: "Kuwait City",
    //             // address: "Kuwait City, Sample St, Famous Alley, NO 13",
    //         },
    //     ]
    // }).send(res);
});

/**
 * Get Event
 * @return Detail of event
 */
//______________________Get Event_____________________//
router.get('/:id', verifyToken(), async function (req, res) {
    console.info('API: Get detail event/init');
    eventController.getById(req.params.id, req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en')
        .then(event => {
            console.info("*** Event By Id : %j", event);
            new NZ.Response(event).send(res);
        })
        .catch(err => {
            console.error("Event Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
    // new NZ.Response({
    //     items: [
    //         {
    //             id: '123',
    //             title: "Ochello’s catwalk fiesta",
    //             desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.",
    //             images: [
    //                 {url: "https://media.crowded.dev.nizek.com/interest/96ToCv/36baa1d8-bf3e-4699-8fdd-ab4bd0933dd4_3SVd6wHgs1.jpg"},
    //                 {url: "https://media.crowded.dev.nizek.com/interest/5wTRsy/9520fccd-a305-4c3b-9acb-620b315a6abc_aUzcRNTUn9.jpg"}
    //             ],
    //             value: 50.00,
    //             Attendance: 60,
    //             from: Date.now().toString(),
    //             to: (Date.now() + 55).toString(),
    //             address: "Kuwait City, Sample St, Famous Alley, NO 13",
    //             area: "Kuwait City",
    //         },
    //
    //     ]
    // }).send(res);
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

module.exports = router;
