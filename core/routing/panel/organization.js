const express = require('express')
    , router = express.Router();
const { uploader } = require('../../utils/fileManager');

// Instantiate the Device Model
const organizationController = require('../../controllers/organization');
const NZ = require('../../utils/nz');
const { verifyTokenPanel } = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate } = require('./../utils');

// models
const Admin = require('../../models/Admin');



const addSchema = Joi.object().keys({
    title: JoiConfigs.title,
    address: JoiConfigs.title,
    phones: Joi.array().items(JoiConfigs.phone),
});


const updateSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
    title:           JoiConfigs.title.optional(),
    address:         JoiConfigs.title.optional(),
    phones:             Joi.array().items(JoiConfigs.phone).optional(),
});

const hasValidIdSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId
});


/**
 *  Add Organization
 * -add Organization in db
 * @return status
 */
//______________________Add Organization_____________________//
router.post('/add', uploader, joiValidate(addSchema), verifyTokenPanel(), async (req, res) => {
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
router.put('/edit', uploader, joiValidate(updateSchema), verifyTokenPanel(), async (req, res) => {
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
 *  Get Organizations
 * @return Organizations
 */
router.post('/', verifyTokenPanel(), async (req, res) => {
    console.info('API: Get Organization List/init');

    organizationController.getManyPanel(req.body)
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
router.get('/:id', verifyTokenPanel(), joiValidate(hasValidIdSchema, 2), async (req, res) => {
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
 * Remove Interest
 */
router.delete('/', verifyTokenPanel(), joiValidate(hasValidIdSchema, 0), async (req, res) => {

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
