const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

// Instantiate the Device Model
const roleController = require('../../controllers/role');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel} = require('../../utils/jwt');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');


const addSchema = Joi.object().keys({
    name:           JoiConfigs.title,
    permissions:    JoiConfigs.array(false),
});

const permissionSchema = Joi.object().keys({
    name:       	JoiConfigs.title,
    permission:    JoiConfigs.title,
});
const updateSchema = Joi.object().keys({
    roleId:       	JoiConfigs.isMongoId,
    permissions:    JoiConfigs.arrayLength(1, 50, permissionSchema),
});


/**
 *  Add Role
 * -add Role in db
 * @return status
 */
//______________________Add Role_____________________//
router.post('/add', joiValidate(addSchema, 0), verifyTokenPanel(), async (req, res) => {
    console.info('API: Add Role/init %j', {body: req.body});

    roleController.add(req.body)
        .then(role => {
            new NZ.Response(null, 'Role has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Role Add Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Update Role
 * -update Role in db
 * @return status
 */
//______________________Update Role_____________________//
router.put('/update', joiValidate(updateSchema, 0), verifyTokenPanel(), async (req, res) => {
    console.info('API: update Role/init %j', {body: req.body});

    roleController.update(req.body.roleId, req.body.permissions)
        .then(role => {
            new NZ.Response(null, role ? 'Role has been successfully update!' : 'Not found!', role ? 200 : 404 ).send(res);
        })
        .catch(err => {
            console.error("Role update Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
