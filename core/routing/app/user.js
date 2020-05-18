const express = require('express')
    , router = express.Router();
const moment = require('moment-timezone');
const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');
const uuid = require('node-uuid');
const userController = require('../../controllers/user');
const controllerUtils = require('../../controllers/utils');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {sign, verifyToken} = require('../../utils/validation');
const settings = require('../../utils/settings');
const nationalities = require('../../utils/nationalities');

const {getHash} = require('../../utils/cacheLayer')



const userRegisterSchema = Joi.object().keys({
    firstname:	    JoiConfigs.title,
    lastname:	    JoiConfigs.title,
    sex:	        JoiConfigs.gender,
    email:          JoiConfigs.email(),
    password:       JoiConfigs.password,
    nationality:    JoiConfigs.title,
    birthDate:      JoiConfigs.datetime,
    });

const userUpdateSchema = Joi.object().keys({
    firstname:	    JoiConfigs.title,
    lastname:	    JoiConfigs.title,
    sex:	        JoiConfigs.gender,
    nationality:    JoiConfigs.title,
    birthDate:      JoiConfigs.datetime(false),
    civilId:        JoiConfigs.strOptional,
    phone:          JoiConfigs.phone(false)
});
const forgotSchema = Joi.object().keys({
    email: JoiConfigs.email(),
});
const changePassSchema = Joi.object().keys({
    oldPassword:    JoiConfigs.password,
    password:       JoiConfigs.password,
});

const claimResetPasswordSchema = Joi.object().keys({
    email: JoiConfigs.email(true),
});

const verifyResetPasswordSchema = Joi.object().keys({
    hash: JoiConfigs.title //TODO: secure validate hash
});


const useResetPasswordSchema = Joi.object().keys({
    hash: JoiConfigs.title, //TODO: secure validate hash
    password: JoiConfigs.password,
    passwordConfirm: Joi.ref('password')
});

/**
 *  Add User
 * -add User in db
 * @return status
 */
//______________________Add User_____________________//
router.post('/register', joiValidate(userRegisterSchema), verifyToken(), async (req, res) => {
    console.info('API: Register User/init %j', {body: req.body});
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
 *  Update User
 * -Update User in db
 * @return status
 */
//______________________Update User_____________________//
router.post('/edit', joiValidate(userUpdateSchema), verifyToken(true), async (req, res) => {
    console.info('API: Update User/init %j', {body: req.body});
    userController.update(req.userId, req.body)
        .then(user => {
            new NZ.Response().send(res);
        })
        .catch(err => {
            console.error("User Update Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        });
});

/**
 *  Add Profile Pic
 * -upload image callback path&name
 * @return status
 */
//______________________Add Profile Pic_____________________//
router.put('/upload', verifyToken(true), uploader, async (req, res) => {
    console.info('API: Add Profile Pic/init req._uploadPath', req._uploadPath);
    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }
    const image = req._uploadPath + '/' + req._uploadFilename;
    userController.update(req.userId, {image: image})
        .then(user => {
            new NZ.Response(true, 'Profile picture uploaded successful!').send(res);
        })
        .catch(err => {
            console.log('!!!! user Update picture profile Failed catch: ', err);
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
            const newToken = sign({deviceId: req.deviceId, userId: user._id});
            //remove userId from other device
            deviceController.update({userId: user._id}, {userId: null, token: null, lastInteract: new Date()})
                .then(result => {
                    //update device(toke,userId)
                    deviceController.update(req.deviceId, {userId: user._id, token: newToken, lastInteract: new Date()})
                        .then(device => {
                            //interest selected from device to user & merge & unique
                            user.interests = Array.from(new Set([...user.interests.map(item => item.toString()), ...device.interests.map(item => item.toString())]));

                            //update user lastLogin
                            user.lastLogin = new Date();
                            user.lastInteract = new Date();
                            user.save();

                            //remove selected interest from device
                            device.interests = [];
                            device.save();
                        }).catch(err => console.error("User Login update device Catch err:", err));
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
            // new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Get User Profile
 * @return User
 */
//______________________Get User_____________________//
router.get('/profile', verifyToken(true), function (req, res) {
    console.info('API: Get profile User/init');

    userController.get(req.userId, 'id')
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("profile Get Catch err:", err)
            // new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Change Password
 */
//______________________Forgot Password_____________________//
router.post('/changePassword',joiValidate(changePassSchema), verifyToken(true), async (req, res) => {
    console.info('API: Change Password User/init %j', {body: req.body});
    userController.get(req.userId, 'id')
        .then(user => {
            if (!user || (user.password !== NZ.sha512Hmac(req.body.oldPassword, user.salt)))
                return new NZ.Response(null, 'Wrong old password, Try again', 400).send(res);
            user.password = NZ.sha512Hmac(req.body.password, user.salt);
            user.save();
            new NZ.Response(null, 'change password success!').send(res);

        })
        .catch(err => {
            console.log('!!!! user login catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});

/**
 * Get Nationalities
 * @return Nationalities
 */
//______________________Get Nationalities_____________________//
router.get('/nationalities', verifyToken(), function (req, res) {
    console.info('API: Get Nationalities User/init');
    const lang = req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en';
    new NZ.Response({items: nationalities[`title_${lang}`]}).send(res);
});


/**
 *  Request a password reset link
 */
//______________________Forgot Password_____________________//
router.post('/resetPassword/claim', joiValidate(claimResetPasswordSchema, 0), async (req, res) => {
    console.info('API: Forgot Password Admin/init %j', {body: req.body});

    userController.get(req.body.email, 'email')
        .then(async user => {
            let email = '';
            if (user) {
                const hash = await controllerUtils.createResetPasswordHash(user.id);
                await controllerUtils.sendEmail(req.body.email, 'Reset Password', 'resetPassword', {
                    name: user.name,
                    logo: settings.email_logo,
                    cdn_domain: settings.cdn_domain,
                    primary_domain: settings.primary_domain,
                    contact_email: settings.contact.email,
                    contact_phone: settings.contact.phone,
                    contact_address: settings.contact.address,
                    contact_copy: settings.contact.copyright,
                    contact_project: settings.project_name,
                    contact_privacy: settings.contact.privacy,
                    contact_terms: settings.contact.terms,
                    link: `${settings.base_panel_route}reset-password-app/${hash}`
                });
                email = 'Email has been sent.';
                return new NZ.Response(true, `Reset-password link generated! ${email}`).send(res);
            } else {
                return new NZ.Response(false, `${req.body.email} is not valid email!`).send(res);
            }


        })
        .catch(err => {
            console.log('!!!! user forgot catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});


/**
 * reset Password verify hash
 * check if the given hash if valid and points to a user
 */
router.post('/resetPassword/verify/', joiValidate(verifyResetPasswordSchema, 0), async (req, res) => {
    return getHash(req.body.hash)
        .then(userId => {
            return userController.get(userId, 'id')
        })
        .then(user => {
            if (!user) return new NZ.Response(null, 'Hash Invalid, Try resetting again...', 400).send(res);
            // else
            return new NZ.Response(true, 'Good to go!').send(res);

        })
        .catch(err => {
            console.log('!!!! user verify hash catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});


/**
 *  reset Password use hash
 *  check hash, reset the password
 */
router.post('/resetPassword/use', joiValidate(useResetPasswordSchema), async (req, res) => {

    try {
        let userId = await getHash(req.body.hash, true);
        let user = await userController.get(userId, 'id')
        if (!user) return new NZ.Response(null, 'Hash Invalid, Try resetting again...', 400).send(res);
        // else
        // !!! update password !!!
        user.password = NZ.sha512Hmac(req.body.password, user.salt);
        await user.save();
        return new NZ.Response(true,'OK.').send(res);
    } catch (err) {
        console.log('!!!! user use hash catch err: ', err);
        new NZ.Response(null, err.message, 400).send(res);
    }
});


module.exports = router;
