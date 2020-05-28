const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');

// Instantiate the Device Model
const staticController = require('../../controllers/static');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel, authorization} = require('../../utils/validation');


const listSchema = JoiConfigs.schemas.list({
    sorts: {
        createdAt: Joi.number().valid(-1, 1),
    },
    defaultSorts: {
        createdAt: -1,
    }
});
const detailSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId
});

const editSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
    name_en: JoiConfigs.title,
    name_ar: JoiConfigs.title,
    html_en: JoiConfigs.html,
    html_ar: JoiConfigs.html,
    in_app: JoiConfigs.booleanVal
})


/**
 * Get Statics
 * @return List Static
 */
router.post('/', verifyTokenPanel(), joiValidate(listSchema, 0), authorization([{PAGE: 'R'}]), async (req, res) => {
    console.info('API: Get Static list %j', {body: req._body});

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
router.put('/edit', verifyTokenPanel(), joiValidate(editSchema, 0), authorization([{PAGE: 'RU'}]), async (req, res) => {
    console.info('API: Edit Static %j', {body: req._body});
    console.log(req.body);

    staticController.update(req._body)
        .then(result => {
            if(!result) throw {message: "StaticPage not found!", code:404};
            new NZ.Response(result, "Static page succefully edited", 200).send(res);
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
router.get('/:id', verifyTokenPanel(),  joiValidate(detailSchema, 2),  authorization([{PAGE: 'R'}]), async (req, res) => {
    console.info('API: Get Static detail %j', {params: req.params});

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
