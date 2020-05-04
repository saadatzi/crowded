const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate } = require('./../utils');

// Instantiate the Device Model
const settingController = require('../../controllers/setting');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const { verifyTokenPanel } = require('../../utils/validation');



const editSettingSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
    value: Joi.string().required()
});


/**
 * Get Settings
 * @return List Setting
 */
router.post('/', verifyTokenPanel(), async (req, res) => {
    console.info('API: Get Setting list %j', { body: req.body });

    settingController.list(req.body)
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
router.put('/edit', verifyTokenPanel(), joiValidate(editSettingSchema,0), async (req, res) => {
    console.info('API: Edit Setting %j', { body: req.body });

    settingController.update(req.body)
        .then(result => {
            if(!result) throw {code:400, message:"Sth went wrong!"};
            new NZ.Response(null, "Setting page succefully edited", 200).send(res);
        })
        .catch(err => {
            console.error("Setting Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});




module.exports = router;