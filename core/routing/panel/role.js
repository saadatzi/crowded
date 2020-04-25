const express = require('express')
    , router = express.Router();

// Instantiate the Device Model
const roleController = require('../../controllers/role');
const permissionController = require('../../controllers/permission');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel} = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');


const permissionSchema = Joi.object().keys({
    permissionId: JoiConfigs.isMongoId,
    accessLevel: JoiConfigs.number
});
const addSchema = Joi.object().keys({
    name:           JoiConfigs.title,
    permissions:    JoiConfigs.array(false, permissionSchema),
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


/**
 *  Get Permission List
 * @return status
 */
//______________________Update Role_____________________//
router.get('/permissions', verifyTokenPanel(), async (req, res) => {
    console.info('API: Permission List/init');

    permissionController.get({})
        .then(permissions => {
            new NZ.Response({items: permissions}).send(res);
        })
        .catch(err => {
            console.error("Permission List Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Get Role List
 * @return status
 */
//______________________Update Role_____________________//
router.get('/', verifyTokenPanel(), async (req, res) => {
    console.info('API: Role List/init');

    roleController.get({})
        .then(roles => {
            new NZ.Response({items: roles}).send(res);
        })
        .catch(err => {
            console.error("Role List Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
