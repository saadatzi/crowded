const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

// Instantiate the Device Model
const roleController = require('../../controllers/role');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyToken} = require('../../utils/jwt');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');


const addSchema = Joi.object().keys({
    name:           JoiConfigs.title,
    permissions:    JoiConfigs.array(false),
});

const updateSchema = Joi.object().keys({
    roleId:       	JoiConfigs.isMongoId,
    permissions:    JoiConfigs.arrayLength(1, 50),
});

// const updateSchema = Joi.object().keys({
//     id: JoiConfigs.idInt,
//     name_en:       	JoiConfigs.title,
//     name_ar:       	JoiConfigs.title,
//     about_en: 	   	JoiConfigs.description,
//     about_ar:      	JoiConfigs.description,
//     categories:		JoiConfigs.idArray,
//     area_id:  		JoiConfigs.idInt,
//     address_en:		JoiConfigs.description,
//     address_ar:		JoiConfigs.description,
//     map_lat:		JoiConfigs.location,
//     map_lng:		JoiConfigs.location
// });

/**
 *  Add Role
 * -add Role in db
 * @return status
 */
//______________________Add Role_____________________//
router.post('/add', joiValidate(addSchema, 0), verifyToken(true), async (req, res) => {
    console.info('API: Add Area/init %j', {body: req.body});

    roleController.add(req.body)
        .then(role => {
            new NZ.Response('Role has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Role Add Catch err:", err)
            res.err(err)
        })
});

/**
 *  Update Role
 * -update Role in db
 * @return status
 */
//Role Area_____________________//
router.post('/update', joiValidate(updateSchema, 0), verifyToken(true), async (req, res) => {
    console.info('API: Add Area/init %j', {body: req.body});

    roleController.update(req.body.roleId, req.body.permissions)
        .then(role => {
            new NZ.Response('Role has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Role Add Catch err:", err)
            res.err(err)
        })
});

module.exports = router;
