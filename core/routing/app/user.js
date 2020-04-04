const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const logger = require('../../utils/winstonLogger');
const Joi = require('@hapi/joi');

const UserController = require('../../controllers/user');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');

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

    UserController.add(req.body)
        .then(user => {
            logger.info("*** User added newUser: %s", user);
        })
        .catch(err => {
            logger.error("User Add Catch err:", err)
            res.err(err)
        })
});

/**
 * Get User
 * @return User
 */
//______________________Get Interest_____________________//
router.get('/', function (req, res) {
    logger.info('API: Get interest/init');

    UserController.get({field: req.body.showField || `title_${req.headers['accept-language']} image`})
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
