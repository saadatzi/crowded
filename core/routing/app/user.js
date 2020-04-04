const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const logger = require('../../utils/winstonLogger');
const Joi = require('@hapi/joi');
const uuid = require('node-uuid');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {sign} = require('../../utils/jwt');

/**
 *  Add User
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add User_____________________//
router.post('/register', async (req, res) => {
    logger.info('API: Register User/init %j', {body: req.body});

    const userSchema = Joi.object().keys({
        user:	Joi.object().keys({
            firstname:	    Joi.string().required(),
            lastname:	    Joi.string().required(),
            sex:	        Joi.number().required(),
            email:          Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }),
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
                    logger.info("*** User added newUser: %s", user);
                    const newToken = sign({deviceId: req.deviceId, userId: user._id});
                    deviceController.update(req.deviceId, {userId: user._id, token: newToken, updateAt: Date.now});
                    new NZ.Response({
                        access_token: newToken,
                        access_type: 'private',
                        user: user
                    }).send(res);
                })
                .catch(err => {
                    logger.error("User Add Catch err:", err)
                    v
                })
        })
        .catch(err => {
            console.log('!!!! user gerByEmail catch ert: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});

/**
 * Get User
 * @return User
 */
//______________________Get Interest_____________________//
router.get('/', function (req, res) {
    logger.info('API: Get interest/init');

    userController.get({field: req.body.showField || `title_${req.headers['accept-language']} image`})
        .then(result => {
            logger.info("*** interest List : %j", result);
            new NZ.Response({
                items:  result,
            }).send(res);
        })
        .catch(err => {
            logger.error("Interest Get Catch err:", err)
            // res.err(err)
        })
});


module.exports = router;
