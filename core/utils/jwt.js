const fs = require('fs');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const NZ = require('./nz');
const deviceController = require('../controllers/device')
const settings = require('./settings')

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
    verifyToken: (isSecure = false) => {
        return async (req, res, next) => {
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
                            if (device) {
                                console.log('>>>>>>> JWT userId: %s ---- deviceId: %s ', device.userId, device._id);
                                // console.log('<<<<<<>>>>>>>>>>>>> JWT device:  ', device);
                                device.lastInteract = new Date();
                                device.save();
                                req.deviceId = (device._id).toString();

                                if (device.userId)
                                    req.userId = (device.userId).toString();

                                if (isSecure && !device.userId)
                                    return new NZ.Response(null, 'must be user', 401).send(res);

                                return next();

                            } else {
                                throw {message: 'token not valid!'}
                            }

                        })
                        .catch(err => {
                            console.error('!!! Device getByToken Catch err ', err);
                            return new NZ.Response(null, 'invalid token err: ' + err.message, 403).send(res);
                        });


                } catch (err) {
                    console.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', err);
                    return new NZ.Response(null, 'invalid token err: ' + err.message, 403).send(res);
                }
            } else {
                console.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return new NZ.Response(null, 'invalid token', 403).send(res);
            }

        }
    }
};