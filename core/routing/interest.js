const express = require('express')
    , router = express.Router();
const jwtRun = require('../utils/jwt')

const logger = require('../utils/winstonLogger');


// Instantiate the Device Model
let InterestController = require('../controllers/interest');
let SessionController = require('../controllers/session');

/**
 *  * init Device
 * -add device in db
 * -add session in db with deviceId
 * -update session with token{deviceId, sessionId}
 * @return token
 */
//______________________Init Device_____________________//
router.post('/add', function (req, res) {
    logger.info('API: interest/init %j', {body: req.body});
    InterestController.add(req.body.device)
        .then(interestId => {
            logger.info("*** interest added interest_id: %s", interestId);
            /*SessionController.add({device: deviceId,})
                .then((session) => {
                    logger.info("*** session added _session: %s", session);
                    const token = jwtRun.sign({deviceId: deviceId, sessionId: session._id});
                    session.setToken(token);
                    res.send({token})
                })
                .catch(err => {
                    logger.error("session Add Catch err:", err)
                    res.err(err)
                })*/
        })
        .catch(err => {
            logger.error("Interest Add Catch err:", err)
            res.err(err)
        })
});


module.exports = router;
