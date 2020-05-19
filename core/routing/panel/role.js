const express = require('express')
    , router = express.Router();

// Instantiate the Device Model
const roleController = require('../../controllers/role');
const permissionController = require('../../controllers/permission');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel, authorization} = require('../../utils/validation');

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
    name:           JoiConfigs.strOptional,
    permissions:    JoiConfigs.array(false, permissionSchema),
});

const deleteSchema = Joi.object().keys({
    roleId:       	JoiConfigs.isMongoId,
});

/**
 *  Add Role
 * -add Role in db
 * @return status
 */
//______________________Add Role_____________________//
router.post('/add', joiValidate(addSchema, 0), verifyTokenPanel(), authorization([{ROLE: 'C'}]), async (req, res) => {
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
router.put('/edit', joiValidate(updateSchema), verifyTokenPanel(), authorization([{ROLE: 'RU'}]), async (req, res) => {
    console.info('API: update Role/init %j', {body: req.body});
    const updateRole = {
        $set: {
            name: req.body.name,
            permissions: req.body.permissions
        }
    }
    roleController.update(req.body.roleId, updateRole)
        .then(role => {
            new NZ.Response(null, role ? 'Role has been successfully update!' : 'Not found!', role ? 200 : 404 ).send(res);
        })
        .catch(err => {
            console.error("Role update Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 *  Get Permission List
 * @return status
 */
//______________________Permission List_____________________//
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
//______________________Role List_____________________//
router.get('/', verifyTokenPanel(), authorization([{ROLE: 'R'}]), async (req, res) => {
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


/**
 *  Test Authorization
 * @return status
 */
//TODO check Authorize
//______________________Test Authorization Role_____________________//
router.post('/authTest', verifyTokenPanel(), async (req, res) => {
    console.info('API: Test Authorization Role/init %j', {body: req.body});
    console.info('API: Test Authorization Role/init userId', req.userId);

    roleController.authorize(req.userId, req.body)
        .then(access => {
            console.log(">>>>>>>>>>>>>>>> Role Authorize ROUT success result %j", access);
            new NZ.Response(access).send(res);
        })
        .catch(err => {
            console.error("Role Test Authorization Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Get Role Detail
 * @return status
 */
//______________________Role Detail_____________________//
router.get('/:id', verifyTokenPanel(), authorization([{ROLE: 'R'}]), async (req, res) => {
    console.info('API: Role Detail/init');

    roleController.get(req.params.id)
        .then(role => {
            new NZ.Response(role).send(res);
        })
        .catch(err => {
            console.error("Role Detail Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Remove Role
 */
router.delete('/', verifyTokenPanel(), joiValidate(deleteSchema), authorization([{ROLE: 'RD'}]), async (req, res) => {
    //Soft delete
    roleController.remove(req.body.roleId)
            .then(result => {
                new NZ.Response(null, "Role removed successfully.").send(res);
            })
            .catch(err => {
                new NZ.Response(null, err.message, err.code || 500).send(res);
            });
    // }

});


module.exports = router;
