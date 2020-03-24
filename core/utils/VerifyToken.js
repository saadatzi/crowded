const logger = require('./winstonLogger');
const jwtRun = require('./jwtRun');

const config = require('config');
const serverConfig = config.get('serverConfig');

function verifyToken(req, res, next) {
    logger.info('******* Verify Token req Start ********** %s', req.originalUrl);
    if (req.originalUrl === `${serverConfig.SN}/device/init` || req.originalUrl === 'api-docs') {
        next();
    } else {
        jwtRun.tokenValidation(req, (state, sessionId) => {
            if (state) {
                logger.info('Is Verified Token API: %s', req.originalUrl);
                req.sessionId = sessionId;
                next();
            } else {
                logger.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return res.status(401).send('Authorization Failed!!!')
            }
        });
    }
}
module.exports = verifyToken;
