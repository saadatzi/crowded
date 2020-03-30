const logger = require('./utils/winstonLogger')
let InterestController = require('./controllers/interest');
(async () => {
    console.log("******* single run **********")
    // InterestController.add({title: 'Sports', image: 'sport.jpg'})
    //     .then(interestId => {
    //         logger.info("*** interest added interest_id: %s", interestId);
    //         /*SessionController.add({device: deviceId,})
    //             .then((session) => {
    //                 logger.info("*** session added _session: %s", session);
    //                 const token = jwtRun.sign({deviceId: deviceId, sessionId: session._id});
    //                 session.setToken(token);
    //                 res.send({token})
    //             })
    //             .catch(err => {
    //                 logger.error("session Add Catch err:", err)
    //                 res.err(err)
    //             })*/
    //     })
    //     .catch(err => {
    //         logger.error("Interest Add Catch err:", err)
    //         res.err(err)
    //     })
})();



console.log('SINGLE RUN');