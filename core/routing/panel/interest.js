const express = require('express')
    , router = express.Router();
const Joi = require('@hapi/joi');

// Instantiate the Device Model
const interestController = require('../../controllers/interest');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const { uploader } = require('../../utils/fileManager');
const { verifyTokenPanel } = require('../../utils/validation');
const { joiValidate } = require('../utils');
const JoiConfigs = require('../joiConfigs');


// Joi valdiator schemas

const editSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
    title_en: JoiConfigs.strOptional,
    title_ar: JoiConfigs.strOptional,
    order: JoiConfigs.strOptional,
});


/**
 *  Add Interest
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add Interest_____________________//
router.post('/add', verifyTokenPanel(), uploader, async (req, res) => {
    console.info('API: Add interest/init %j', {body: req.body});

    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    req.body.image = req._uploadPath + '/' + req._uploadFilename;
    interestController.add(req.body)
        .then(interest => {
            new NZ.Response({ item: interest }).send(res);
        })
        .catch(err => {
            console.error("Interest Add Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
});


/**
 * Edit Interest
 */
router.put('/edit', verifyTokenPanel(), uploader, joiValidate(editSchema, 0), async (req, res) => {
    if (req._uploadPath && req._uploadFilename) req.body.image = req._uploadPath + '/' + req._uploadFilename;
    interestController.update(req.body)
        .then(result=>{
            new NZ.Response(null,"Interest edited successfully.").send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,500).send(res);
        });
});


/**
 * Get Interest
 * @return list of interest
 */
//______________________Get Interest_____________________//
router.get('/', verifyTokenPanel(), async function (req, res) {
    console.info('API: Get interest/init');

    interestController.get({ selected: [], lang: req.headers['lang'] ? (req.headers['lang']).toLowerCase() : 'en' })
        .then(result => {
            console.info("*** interest List : %j", result);
            new NZ.Response({ items: result, }).send(res);
        })
        .catch(err => {
            console.error("Interest Get Catch err:", err)
            new NZ.Response(null, err.message, 500).send(res);
        })
});
module.exports = router;
