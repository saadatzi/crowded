const express = require('express')
    , router = express.Router();
const Joi = require('@hapi/joi');

// Instantiate the Device Model
const interestController = require('../../controllers/interest');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');
const {verifyTokenPanel, authorization} = require('../../utils/validation');
const {joiValidate} = require('../utils');
const JoiConfigs = require('../joiConfigs');

// Models
const Device = require('../../models/Device');
const Event = require('../../models/Event');
const User = require('../../models/User');


// Joi valdiator schemas

const hasValidIdSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId
});

const addSchema = Joi.object().keys({
    title_en: JoiConfigs.title,
    title_ar: JoiConfigs.title,
    order: JoiConfigs.number,
});

const editSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
    title_en: JoiConfigs.title,
    title_ar: JoiConfigs.title,
    order: JoiConfigs.number,
});


/**
 *  Add Interest
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add Interest_____________________//
router.post('/add', uploader, joiValidate(addSchema), verifyTokenPanel(), authorization([{INTEREST: 'C'}]), async (req, res) => {
    console.info('API: Add interest/init %j', {body: req.body});

    if (!req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }

    req.body.image = req._uploadPath + '/' + req._uploadFilename;
    interestController.add(req.body)
        .then(interest => {
            new NZ.Response(true, 'Added interest successfully!').send(res);
        })
        .catch(err => {
            console.error("Interest Add Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 * Edit Interest
 */
router.put('/edit', uploader, joiValidate(editSchema), verifyTokenPanel(), authorization([{INTEREST: 'RU'}]), async (req, res) => {
    if (req._uploadPath && req._uploadFilename) req.body.image = req._uploadPath + '/' + req._uploadFilename;
    interestController.update(req.body)
        .then(result => {
            new NZ.Response(null, "Interest edited successfully.").send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });
});

/**
 * Remove Interest
 */
router.delete('/', verifyTokenPanel(), joiValidate(hasValidIdSchema, 0), authorization([{INTEREST: 'RD'}]), async (req, res) => {

    let id = req.body.id;
    let flag = false;

    // await check events
    flag = await Event.interestIsRelated(id);

    // await check devices
    flag = flag || await Device.interestIsRelated(id);

    // await check users
    flag = flag || await User.interestIsRelated(id);

    if (flag) {
        return new NZ.Response(null, "Couldn`t remove the interest due to its relation to other collections", 400).send(res);
    } else {
        interestController.remove(id)
            .then(result => {
                new NZ.Response(null, "Interest removed successfully.").send(res);
            })
            .catch(err => {
                new NZ.Response(null, err.message, 500).send(res);
            });
    }

});


/**
 * Get Interests
 * @return list of interests
 */
router.post('/', verifyTokenPanel(), authorization([{INTEREST: 'R'}]), async function (req, res) {
    interestController.getManyPanel(req.body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });

});


/**
 * Get Interest for panel Detail
 * @return list of interests
 */
router.get('/:id', verifyTokenPanel(), authorization([{INTEREST: 'R'}]), async function (req, res) {
    let options = {
        _id: req.params.id
    };
    interestController.getOnePanel(options)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });

});
module.exports = router;
