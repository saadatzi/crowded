const express = require('express')
    , router = express.Router();

// Instantiate the Device Model
const organizationController = require('../../controllers/organization');
const NZ = require('../../utils/nz');
const {verifyTokenPanel} = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate} = require('./../utils');
const {uploader, multiUploader} = require('../../utils/fileManager');



const addSchema = Joi.object().keys({
    title:           JoiConfigs.title,
    address:         JoiConfigs.title,
    phones:             Joi.array().items(JoiConfigs.phone),
});


const updateSchema = Joi.object().keys({
    organizationId:       	JoiConfigs.isMongoId,
    name:           JoiConfigs.title,
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
    console.info('API: Add Organization/init %j', {body: req.body});

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
//______________________Update Organization_____________________//
router.put('/update', joiValidate(updateSchema), verifyTokenPanel(), async (req, res) => {
    console.info('API: update Organizatio n/init %j', {body: req.body});

    organizationController.update(req.body.organizationId, req.body.permissions)
        .then(organization => {
            new NZ.Response(null, organization ? 'Organization has been successfully update!' : 'Not found!', organization ? 200 : 404 ).send(res);
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
router.get('/:id', verifyTokenPanel(), joiValidate(hasValidIdSchema,2) ,async (req, res) => {
    console.info('API: Get Organization');

    organizationController.getOnePanel({_id:req.params.id})
        .then(organization => {
            new NZ.Response(organization).send(res);
        })
        .catch(err => {
            console.error("Organization getOnePanel Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

module.exports = router;
