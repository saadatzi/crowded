const express = require('express')
    , router = express.Router();
const { uploader } = require('../../utils/fileManager');

// Instantiate the Device Model
const organizationController = require('../../controllers/organization');
const NZ = require('../../utils/nz');
const { verifyTokenPanel, authorization } = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate, grabSettings} = require('./../utils');

// models
const Admin = require('../../models/Admin');



const addSchema = Joi.object().keys({
    title: JoiConfigs.title,
    address: JoiConfigs.title,
    phones: Joi.array().items(JoiConfigs.phone),
    commissionPercentage: JoiConfigs.price
});


const updateSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
    title:           JoiConfigs.title.optional(),
    address:         JoiConfigs.title.optional(),
    phones:          Joi.array().items(JoiConfigs.phone).optional(),
    status:          Joi.number().optional(),
    commissionPercentage: JoiConfigs.price
});

const hasValidIdSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId
});

const listSchema = JoiConfigs.schemas.list({
    filters:{
        status: Joi.number().valid(0, 1)
    },
    sorts:{
        createdAt: Joi.number().valid(-1,1),
        title: Joi.number().valid(-1,1),
        commissionPercentage: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        createdAt: -1,
    }
});


const activateSchema = Joi.object().keys({
    orgId: JoiConfigs.isMongoId,
    isActive: JoiConfigs.boolInt,
});


/**
 *  Add Organization
 * -add Organization in db
 * @return status
 */
//______________________Add Organization_____________________//
router.post('/add', uploader, joiValidate(addSchema), verifyTokenPanel(), authorization([{ORGANIZATION: 'C'}]), async (req, res) => {
    console.info('API: Add Organization/init %j', { body: req.body });

    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }
    // else 

    req.body.image = req._uploadPath + '/' + req._uploadFilename;

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
router.put('/edit', uploader, joiValidate(updateSchema), verifyTokenPanel(), authorization([{ORGANIZATION: 'RU'}]), async (req, res) => {
    console.info('API: update Organizationn %j', { body: req.body });

    if (req._uploadPath && req._uploadFilename) {
        req.body.image = req._uploadPath + '/' + req._uploadFilename;
    }
    // anyways 

    const id = req.body.id;
    delete req.body.id;

    organizationController.update(id, req.body)
        .then(organization => {
            new NZ.Response(null, organization ? 'Organization has been successfully update!' : 'Not found!', organization ? 200 : 404).send(res);
        })
        .catch(err => {
            console.error("Organization update Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Activation Organization
 * -UPDATE org status in db
 * @return status
 */
//______________________Add Event_____________________//
router.put('/activate', joiValidate(activateSchema), verifyTokenPanel(), authorization([{ORGANIZATION: 'RU'}]), async (req, res) => {
    console.info('API: Activation Org/init %j', {body: req.body});

    organizationController.update(req.body.orgId, {status: req.body.isActive})
        .then(org => {
            const resultMessage = req.body.isActive ? 'Organization Activation successful!' : 'Organization Deactivation successful!';
            new NZ.Response(!!org, org ? resultMessage : 'Not Found!', org ? 200 : 404).send(res);
        })
        .catch(err => {
            console.error("Org Activation Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Get List Organizations
 * @return Organizations
 */
router.post('/', verifyTokenPanel(), authorization([{ORGANIZATION: 'R'}]),  grabSettings(), joiValidate(listSchema,0) ,async (req, res) => {
    console.info('API: Get Organization List/init');

    organizationController.getManyPanel(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Organization List Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Get Organization
 * @return Organizations
 */
router.get('/:id', verifyTokenPanel(), joiValidate(hasValidIdSchema, 2), authorization([{ORGANIZATION: 'R'}]), async (req, res) => {
    console.info('API: Get Organization');

    organizationController.getOnePanel({ _id: req.params.id })
        .then(organization => {
            new NZ.Response(organization).send(res);
        })
        .catch(err => {
            console.error("Organization getOnePanel Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Remove Organization
 */
router.delete('/', verifyTokenPanel(), joiValidate(hasValidIdSchema, 0), authorization([{ORGANIZATION: 'RD'}]), async (req, res) => {

    let id = req.body.id;

    // await check events
    let flag = await Admin.organizationIsRelated(id);


    if (flag) {
        return new NZ.Response(null, "Couldn`t remove the organization due to its relation to other collections", 400).send(res);
    } else {
        organizationController.remove(id)
            .then(result => {
                new NZ.Response(null, "Organization removed successfully.").send(res);
            })
            .catch(err => {
                new NZ.Response(null, err.message, 500).send(res);
            });
    }

});

module.exports = router;
