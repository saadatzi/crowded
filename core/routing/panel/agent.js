const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

// Instantiate the Device Model
const agentController = require('../../controllers/agent');
const NZ = require('../../utils/nz');
const {sign, verifyTokenPanel} = require('../../utils/jwt');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');

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

/**
 *  login Panel
 */
//______________________Login Panel_____________________//
router.post('/login', joiValidate(loginSchema, 0), async (req, res) => {
    console.info('API: Login Panel User/init %j', {body: req.body});

    agentController.auth(req.body.email, req.body.password)
        .then(user => {
            const token = sign({userId: user._id});
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
    const newToken = sign({deviceId: req.deviceId});
    deviceController.update(req.deviceId, {userId: null, token: newToken, updateAt: Date.now()})
        .then(device => {
            new NZ.Response({
                access_token: newToken,
                access_type: 'public'
            }).send(res);
        })
        .catch(err => {
            console.log('!!!! user logout Panel catch ert: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
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
            new NZ.Response(agent, 'Agent has been successfully added!').send(res);
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

module.exports = router;
