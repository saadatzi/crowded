const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');

// Instantiate the Device Model
const areaController = require('../../controllers/area');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel} = require('../../utils/validation');
const childSchema = Joi.object().keys({
    name_en: JoiConfigs.title,
    name_ar: JoiConfigs.title,
});
const addSchema = Joi.object().keys({
    name_en: JoiConfigs.title,
    name_ar: JoiConfigs.title,
    childs: JoiConfigs.arrayLength(1, 100, childSchema),
});

const addArraySchema = Joi.object().keys({
    selected: JoiConfigs.arrayLength(1, 100, addSchema),
});

/**
 *  Add Area
 * -add Area in db
 * @return status
 */
//______________________Add Area_____________________//
router.post('/add', joiValidate(addSchema), verifyTokenPanel(), async (req, res) => {
    console.info('API: Add Area/init %j', {body: req.body});

    areaController.add(req.body)
        .then(area => {
            new NZ.Response('', area.length + ' Area has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Area Add Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Add Area Array
 * -add Area in db
 * @return status
 */
//______________________Add Area_____________________//
router.post('/addMulti', joiValidate(addArraySchema), verifyTokenPanel(), async (req, res) => {
    console.info('API: Add Area/init %j', {body: req.body});

    areaController.add(req.body)
        .then(area => {
            new NZ.Response('', area.length + ' Area has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Area Add Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Get Area
 * @return List Area
 */
//______________________Get Area_____________________//
router.get('/', verifyTokenPanel(), async (req, res) => {
    console.info('API: Get Area/init %j', {body: req.body});

    areaController.get({})
        .then(areas => {
            new NZ.Response({items: areas}).send(res);
        })
        .catch(err => {
            console.error("Area Get Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
