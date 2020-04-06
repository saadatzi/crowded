const fs = require('fs');
const jwt = require('jsonwebtoken');
const API = require('./introduceEndpoint');
const NZ = require('./nz');
const deviceController = require('../controllers/device')

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
        console.info('API: JWT sign payload %j ', payload);
        return jwt.sign(payload, privateKEY, tokenOption);
    },
    decode: (token) => {
        return jwt.decode(token, {complete: true});
        //returns null if token is invalid
    },
    verifyToken: (req, res, next) => {
        const strApi = req.method + (req.originalUrl).replace(new RegExp('/', 'g'), '_');
        const api = API[strApi];
        console.info('******* Verify Token req Start req.originalUrl: %s -- %s %j', req.method, req.originalUrl, api);
        if (!api) {
            return new NZ.Response({}, 'Endpoint not found!', 404).send(res);
        }
        if (!api.needToken && !api.isSecure) {
            next();
        } else {
            let token = req.headers['x-token']; // Express headers are auto converted to lowercase
            if (token && token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            if (token) {
                try {
                    //ToDo from jwt
                    //// let tokenObj = jwt.verify(token, publicKEY, tokenOption);
                    // if (!tokenObj) throw {errCode: 401};
                    //
                    // req.deviceId = tokenObj.deviceId;
                    // if (tokenObj.userId) req.userId = tokenObj.userId;
                    deviceController.get(token, 'token')
                        .then(device => {
                            device.lastInteract = Date.now();
                            device.save();
                            req.deviceId = device._id;
                            if (!api.isSecure) next();
                            else if (api.isSecure && device.userId) {
                                req.userId = device.userId;
                                next();
                            } else {
                                return new NZ.Response(null, 'must be user', 401).send(res);
                            }
                        })
                        .catch(err => {
                            console.error('!!! Device getByToken Catch err ', err);
                            throw err;
                        });



                } catch (err) {
                    // if (err.errCode === 401) {
                    //     console.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                    //     return new NZ.Response(null, 'Authorization Failed!!!', 401).send(res);
                    // }
                    console.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', err);
                    return new NZ.Response(null, 'invalid token err: '+err.message, 403).send(res);
                }
            } else {
                console.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return new NZ.Response(null, 'invalid token', 403).send(res);
            }
        }
    }
};