const express = require('express')
    , router = express.Router();

// Instantiate the Device Model
const agentController = require('../../controllers/agent');
const userController = require('../../controllers/user');
const NZ = require('../../utils/nz');
const {sign, verifyTokenPanel} = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');

const {getForgotHash} = require('../../utils/cacheLayer')

const callSchema = Joi.object().keys({
    type: JoiConfigs.title,
    value: JoiConfigs.title,
});

const addSchema = Joi.object().keys({
    email: JoiConfigs.email(),
    name: JoiConfigs.title,
    password: JoiConfigs.password,
    role: JoiConfigs.arrayLength(1, 50, JoiConfigs.isMongoId),
    lastIp: JoiConfigs.strOptional,
    call: JoiConfigs.array(false, callSchema),
    organizationId: JoiConfigs.isMongoId
});


const updateSchema = Joi.object().keys({
    agentId: JoiConfigs.isMongoId,
    name: JoiConfigs.title,
    password: JoiConfigs.password,
    role: JoiConfigs.arrayLength(1, 50, JoiConfigs.isMongoId),
    lastIp: JoiConfigs.strOptional,
    call: JoiConfigs.array(false, callSchema),
    organizationId: JoiConfigs.isMongoId
});

const loginSchema = Joi.object().keys({
    email: JoiConfigs.email(),
    password: JoiConfigs.password,
});

const forgotSchema = Joi.object().keys({
    email: JoiConfigs.email(),
});

/**
 *  login Panel
 */
//______________________Login Panel_____________________//
router.post('/login', joiValidate(loginSchema, 0), async (req, res) => {
    console.info('API: Login Panel User/init %j', {body: req.body});

    agentController.auth(req.body.email, req.body.password)
        .then(user => {
            const token = sign({userId: user.id});
            new NZ.Response({user, token}).send(res);

        })
        .catch(err => {
            console.log('!!!! user login Panel catch err: ', err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        });
});

/**
 *  logout Panel
 */
//______________________Logout_____________________//
router.get('/logout', verifyTokenPanel(), async (req, res) => {
    console.info('API: logout Panel User/init');
    // const newToken = sign({deviceId: req.deviceId});
    //TODO redis Token blackList
    new NZ.Response(true).send(res);

});


/**
 *  Add Agent
 * -add Agent in db
 * @return status 5e9fa191c12938e496a23480
 */
//______________________Add Agent_____________________//
router.post('/add', joiValidate(addSchema, 0), verifyTokenPanel(), async (req, res) => {
    console.info('API: Add Agent/init %j', {body: req.body});

    agentController.add(req.body)
        .then(agent => {
            new NZ.Response(true, 'Agent has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Agent Add Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Update Agent
 * -update Agent in db
 * @return status
 */
//______________________Update Agent_____________________//
router.put('/update', joiValidate(updateSchema, 0), verifyTokenPanel(), async (req, res) => {
    console.info('API: update Agent/init %j', {body: req.body});

    agentController.update(req.body.agentId, req.body.permissions)
        .then(agent => {
            new NZ.Response(agent, agent ? 'Agent has been successfully update!' : 'Not found!', agent ? 200 : 404).send(res);
        })
        .catch(err => {
            console.error("Agent update Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Forgot Password
 */
//______________________Forgot Password_____________________//
router.post('/forgotPassword', joiValidate(forgotSchema, 0), async (req, res) => {
    console.info('API: Forgot Password Admin/init %j', {body: req.body});


    agentController.get(req.body.email)
        .then(async user => {
            let email = '';
            if (user) {
                const hash = await controllerUtils.createResetPasswordHash(user.id);

                await controllerUtils.sendEmail(user.email, 'Reset Password', 'reset-password', {
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
                    link: `${settings.panel_route}panel/reset-password/${hash}`
                });
                email = 'Email has been sent.';
                return new NZ.Response(true, `Password has been reset! ${email}`).send(res);
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
 *  reset Password link
 * -get user from hash
 * -remove hash
 * -update Password
 * @return template reset password
 */
//______________________Update Agent_____________________//
router.post('/reset-password/:token', async (req, res) => {
    const userId = await getForgotHash(req.params.token);

    userController.get(userId, 'id')
        .then(user => {
            if (!user) return new NZ.Response(null, 'Token Invalid, Try resetting again...', 400).send(res);

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

    const password = req.body.password;
    if (password.length < 6)
        return new NZ.Response(null, 'New password length should be at least 6 characters', 400).send(res);

    await generalModel.invalidateResetHash(req.params.token);

    if (user.type == 'admin') {
        await adminModel.setPassword(user.id, password);
    } else if (user.type == 'user') {
        await userModel.setPassword(user.id, password);
    }

    return new NZ.Response(user.type).send(res);
});

module.exports = router;
