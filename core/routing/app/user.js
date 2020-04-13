const express = require('express')
    , router = express.Router();
const moment = require('moment-timezone');
const Joi = require('@hapi/joi');
const uuid = require('node-uuid');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {sign, verifyToken} = require('../../utils/jwt');
const settings = require('../../utils/settings');

/**
 *  Add User
 * -add User in db
 * @return status
 */
//______________________Add User_____________________//
router.post('/register', verifyToken(), async (req, res) => {
    console.info('API: Register User/init %j', {body: req.body});

    // req.body.email = (req.body.email).toString().toLowerCase();

    const userSchema = Joi.object().keys({
        user:	Joi.object().keys({
            firstname:	    Joi.string().required(),
            lastname:	    Joi.string().required(),
            sex:	        Joi.number().required(),
            email:          Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required(),
            password:       Joi.string().min(6).max(63).required(),
            nationality:    Joi.string().required(),
            birthDate:      Joi.date().required(),
        }).required(),
    });

    let userValidation = userSchema.validate({user: req.body});
    if (userValidation.error)
        return new NZ.Response(userValidation.error, 'input error.', 400).send(res);
    userController.get(req.body.email)
        .then(oldUser => {
            if (oldUser) return new NZ.Response(null, 'A user with this email already exists', 400).send(res);

            //hash password
            req.body.salt = NZ.sha512(uuid.v4());
            req.body.password = NZ.sha512Hmac(req.body.password, req.body.salt);

            userController.add(req.body)
                .then(user => {
                    const newToken = sign({deviceId: req.deviceId, userId: user.id});
                    deviceController.update(req.deviceId, {userId: user.id, token: newToken, updateAt: Date.now()})
                        .then(device => {
                            //interest selected from device to user
                            user.interests = device.interests;
                            user.save();
                            //remove selected interest from device
                            device.interests = [];
                            device.save();
                        }).catch(err => console.error("User register update device Catch err:", err));
                    new NZ.Response({
                        access_token: newToken,
                        access_type: 'private',
                        user: userController.dto(user)
                    }).send(res);
                })
                .catch(err => {
                    console.error("User register Catch err:", err);
                })
        })
        .catch(err => {
            console.log('!!!! user register catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});

/**
 *  login
 */
//______________________Login_____________________//
router.post('/login', verifyToken(), async (req, res) => {
    console.info('API: Login User/init %j', {body: req.body});
    // req.body.email = (req.body.email).toString().toLowerCase();
    const loginSchema = Joi.object().keys({
        login:	Joi.object().keys({
            email:          Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required(),
            password:       Joi.string().min(6).max(63).required(),
        }).required(),
    });

    let loginValidation = loginSchema.validate({login: req.body});
    if (loginValidation.error)
        return new NZ.Response(loginValidation.error, 'input error.', 400).send(res);
    userController.get(req.body.email)
        .then(user => {
            if (!user || (user.password !== NZ.sha512Hmac(req.body.password, user.salt)))
                return new NZ.Response(null, 'Wrong email or password, Try again', 400).send(res);
            console.error("User Login user:", user);
            const newToken = sign({deviceId: req.deviceId, userId: user._id});
            //update device(toke,userId,updateAt)
            deviceController.update(req.deviceId, {userId: user._id, token: newToken, updateAt: Date.now()})
                .then(device => {
                    //interest selected from device to user & merge & unique
                    user.interests = Array.from(new Set([...user.interests.map(item => item.toString()), ...device.interests.map(item => item.toString())]));
                    // user.interests.addToSet(device.interests);
                    //update user lastLogin
                    user.lastLogin = Date.now();
                    user.lastInteract = Date.now();
                    user.save();
                    //remove selected interest from device
                    device.interests = [];
                    device.save();
                }).catch(err => console.error("User Login update device Catch err:", err));
            new NZ.Response({
                access_token: newToken,
                access_type: 'private',
                user: userController.dto(user)
            }).send(res);

        })
        .catch(err => {
            console.log('!!!! user login catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});

/**
 *  logout
 */
//______________________Logout_____________________//
router.get('/logout', verifyToken(true), async (req, res) => {
    console.info('API: logout User/init');
    const newToken = sign({deviceId: req.deviceId});
    deviceController.update(req.deviceId, {userId: null, token: newToken, updateAt: Date.now()})
        .then(device => {
            new NZ.Response({
                access_token: newToken,
                access_type: 'public'
            }).send(res);
        })
        .catch(err => {
            console.log('!!!! user logout catch ert: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});

/**
 * Get User
 * @return User
 */
//______________________Get User_____________________//
router.get('/', function (req, res) {
    console.info('API: Get User/init');

    userController.get({failed: req.body.showField || `title_${req.headers['accept-language']} image`})
        .then(result => {
            console.info("*** interest List : %j", result);
            new NZ.Response({
                items:  result,
            }).send(res);
        })
        .catch(err => {
            console.error("Interest Get Catch err:", err)
            // res.err(err)
        })
});


module.exports = router;
