const express = require('express')
    , router = express.Router();

// Instantiate the Device Model
const organizationController = require('../../controllers/organization');
const NZ = require('../../utils/nz');
const {verifyTokenPanel} = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');


const addSchema = Joi.object().keys({
    name:           JoiConfigs.title,
});


const updateSchema = Joi.object().keys({
    organizationId:       	JoiConfigs.isMongoId,
    name:           JoiConfigs.title,
});


/**
 *  Add Organization
 * -add Organization in db
 * @return status
 */
//______________________Add Organization_____________________//
router.post('/add', joiValidate(addSchema, 0), verifyTokenPanel(), async (req, res) => {
    console.info('API: Add Organization/init %j', {body: req.body});

    organizationController.add(req.body)
        .then(organization => {
            new NZ.Response(organization, 'Organization has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Organization Add Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Update Organization
 * -update Organization in db
 * @return status
 */
//______________________Update Organization_____________________//
router.put('/update', joiValidate(updateSchema, 0), verifyTokenPanel(), async (req, res) => {
    console.info('API: update Organization/init %j', {body: req.body});

    organizationController.update(req.body.organizationId, req.body.permissions)
        .then(organization => {
            new NZ.Response(null, organization ? 'Organization has been successfully update!' : 'Not found!', organization ? 200 : 404 ).send(res);
        })
        .catch(err => {
            console.error("Organization update Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
