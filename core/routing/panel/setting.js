const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate, grabSettings} = require('./../utils');

// Instantiate the Device Model
const settingController = require('../../controllers/setting');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel, authorization} = require('../../utils/validation');


const editSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
    valueType: Joi.string().valid('String', 'Boolean', 'Number').required(),
    value: Joi.any()
        .when('valueType', {is: Joi.string().valid('String'), then: Joi.string().required()})
        .when('valueType', {is: Joi.string().valid('Number'), then: JoiConfigs.number})
        .when('valueType', {is: Joi.string().valid('Boolean'), then: JoiConfigs.boolInt})
});

const listSchema = JoiConfigs.schemas.list({
    sorts: {
        createdAt: Joi.number().valid(-1, 1),
    },
    defaultSorts: {
        createdAt: -1,
    }
});


/**
 * Get Settings
 * @return List Setting
 */
router.post('/', verifyTokenPanel(), grabSettings(), joiValidate(listSchema), authorization([{SETTING: 'R'}]), async (req, res) => {
    console.info('API: Get Setting list %j', {body: req._body});

    settingController.list(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Setting Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Edit Setting
 * @return Setting
 */
router.put('/edit', verifyTokenPanel(), joiValidate(editSchema), authorization([{SETTING: 'RU'}]), async (req, res) => {
    console.info('API: Edit Setting %j', {body: req.body});

    settingController.update(req.body)
        .then(result => {
            if (!result) throw {code: 400, message: "Sth went wrong!"};
            new NZ.Response(null, "Setting page succefully edited", 200).send(res);
        })
        .catch(err => {
            console.error("Setting Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


module.exports = router;
