const fs = require('fs');
const validation = require('jsonwebtoken');
const moment = require('moment-timezone');
const NZ = require('./nz');
const deviceController = require('../controllers/device');
const roleController = require('../controllers/role');
const adminController = require('../controllers/admin');
const settings = require('./settings')

// use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY = fs.readFileSync(__dirname + '/private.key', 'utf8');
const publicKEY = fs.readFileSync(__dirname + '/public.key', 'utf8');
const tokenOption = {
    issuer: "Authorization/Resource/Nizek server",
    subject: "crowded",
    algorithm: "RS256"
    // expiresIn: "30d",
};
module.exports = {
    sign: (payload) => {
        console.info('API: JWT sign payload %j ', payload);
        return validation.sign(payload, privateKEY, tokenOption);
    },
    decode: (token) => {
        return validation.decode(token, {complete: true});
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
                    //TODO from validation
                    //// let tokenObj = validation.verify(token, publicKEY, tokenOption);
                    // if (!tokenObj) throw {errCode: 401};
                    //
                    // req.deviceId = tokenObj.deviceId;
                    // if (tokenObj.userId) req.userId = tokenObj.userId;
                    req.deviceId = null;
                    req.userId = null;
                    deviceController.get(token, 'token')
                        .then(device => {
                            if (device) {
                                console.log('>>>>>>> JWT userId: %s ---- deviceId: %s ', device.userId, device._id);
                                // console.log('<<<<<<>>>>>>>>>>>>> JWT device:  ', device);
                                device.lastInteract = new Date();
                                device.save();
                                req.deviceId = (device._id).toString();

                                req.userId = null;
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
                    console.error('!!!Verify Token Catch! Token: Authorization Failed!!! => API: %s', err);
                    return new NZ.Response(null, 'invalid token err: ' + err.message, 403).send(res);
                }
            } else {
                console.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return new NZ.Response(null, 'invalid token', 403).send(res);
            }

        }
    },
    verifyTokenPanel: () => {
        return async (req, res, next) => {
            let token = req.headers['authorization']; // Express headers are auto converted to lowercase
            if (token && token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            if (token) {
                try {
                    let tokenObj = validation.verify(token, publicKEY, tokenOption);
                    if (!tokenObj) return new NZ.Response(null, 'invalid token ', 401).send(res);
                    adminController.get(tokenObj.userId, 'id')
                        .then(user => {
                            // user.lastIp = req.headers['x-real-ip'];
                            // user.lastInteract =  new Date();
                            // user.save();
                            user.updateOne({
                                $set: {lastIp: req.headers['x-real-ip'], lastInteract: new Date()},
                            })
                                .catch(err => {
                                    console.error("!!!!!!!!Admin lastIp lastInteract update catch err: ", err);
                                });
                        })
                        .catch(err => console.error('!!!adminController get byId Failed!!! ', err));
                    req.userId = tokenObj.userId;
                    return next();
                } catch (err) {
                    console.error('!!!Panel Verify Token Catch! Token: Authorization Failed!!! => API: %s', err);
                    return new NZ.Response(null, 'invalid token err: ' + err.message, 401).send(res);
                }
            } else {
                console.error('!!!Panel Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return new NZ.Response(null, 'invalid token', 401).send(res);
            }

        }
    },
    authorization: (permissions = []) => {
        return async (req, res, next) => {
            console.error('>>>>>>>>>>>>>>>>>>>>> authorization userId', req.userId);
            roleController.authorize(req.userId, permissions)
                .then(accessLevel => {
                    if (!accessLevel.access) return new NZ.Response(null, 'You do not have the need permissions for this request!', 403).send(res);
                    req.auth = accessLevel;
                    return next();
                })
                .catch(err => {
                    console.error("Role Authorization Catch err:", err);
                    return new NZ.Response(null, 'Authorization err: ' + err.message, 403).send(res);
                })
        }
    }
};