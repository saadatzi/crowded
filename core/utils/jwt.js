const fs = require('fs');
const jwt = require('jsonwebtoken');
const API = require('./introduceEndpoint');
const NZ = require('./nz');
const logger = require('./winstonLogger');


// use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY = fs.readFileSync(__dirname + '/private.key', 'utf8');
const publicKEY = fs.readFileSync(__dirname + '/public.key', 'utf8');
const tokenOption = {
    issuer: "Authorization/Resource/Nizek server",
    subject: "m.hejazi@nizek.com",
    algorithm: "RS256"
    // expiresIn: "30d",
};
module.exports = {
    sign: (payload) => {
        logger.info('API: JWT sign payload %j ', payload);
        return jwt.sign(payload, privateKEY, tokenOption);
    },
    decode: (token) => {
        return jwt.decode(token, {complete: true});
        //returns null if token is invalid
    },
    verifyToken: (req, res, next) => {
        const strApi = req.method + (req.originalUrl).replace(new RegExp('/', 'g'), '_');
        const api = API[strApi];
        logger.info('******* Verify Token req Start ********** %j', api);
        logger.info('******* Verify Token req.originalUrl: %s', req.originalUrl);
        if (!api) {
            return new NZ.Response({}, 'Not found Endpoint!', 404).send(res);
        }
        if (!api.needToken && !api.isSecure) {
            next();
        } else {
            if (api.isSecure) {
                //ToDo check login in DB
            }
            let token = req.headers['x-token']; // Express headers are auto converted to lowercase
            if (token && token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            if (token) {
                try {
                    let tokenObj = jwt.verify(token, publicKEY, tokenOption);
                    if (!tokenObj) throw {errCode: 401};

                    req.sessionId = tokenObj.sessionId;
                    next();
                } catch (err) {
                    if (err.errCode === 401) {
                        logger.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                        return new NZ.Response(null, 'Authorization Failed!!!', 401).send(res);
                    }
                }
            } else {
                logger.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return new NZ.Response(null, 'invalid token', 403).send(res);
            }
        }
    }
};