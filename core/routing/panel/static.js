const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate } = require('./../utils');

// Instantiate the Device Model
const staticController = require('../../controllers/static');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const { verifyTokenPanel } = require('../../utils/validation');




const listSchema = JoiConfigs.schemas.list({});

/**
 * Get Statics
 * @return List Static
 */
router.post('/', verifyTokenPanel(), joiValidate(listSchema,0), async (req, res) => {
    console.info('API: Get Static list %j', { body: req._body });

    staticController.list(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Static Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Edit Static
 * @return Static
 */
router.put('/edit', verifyTokenPanel(), async (req, res) => {
    console.info('API: Edit Static %j', { body: req.body });

    staticController.update(req.body)
        .then(result => {
            new NZ.Response(null, "Static page succefully edited", 200).send(res);
        })
        .catch(err => {
            console.error("Static Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Get Static detail
 * @return List Static
 */
router.get('/:id', verifyTokenPanel(), async (req, res) => {
    console.info('API: Get Static detail %j', { body: req.params });

    staticController.getById(req.params.id)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Static Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


module.exports = router;
