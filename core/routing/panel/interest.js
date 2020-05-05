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
const settings = require('../../utils/settings');


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
    //TODO s.Mahdi: why Optional?
    title_en: JoiConfigs.strOptional,
    title_ar: JoiConfigs.strOptional,
    order: JoiConfigs.strOptional,
});


const listSchema = Joi.object().keys({
    search: 
        Joi.string().optional().default(""),
    filters:
        Joi.object().optional()
            .keys({
                status: Joi.number().valid(0, 1, 2).default(1)
            })
            .default(),
    pagination:
        Joi.object().optional()
            .keys({
                page: Joi.number().greater(-1).default(0),
                limit: Joi.number().greater(0).default(settings.panel.defaultLimitPage),
            })
            .default(),
    sorts:
        Joi.object().optional()
            .keys({
                title_en: Joi.number().optional().valid(-1, 1),
                title_ar: Joi.number().optional().valid(-1, 1),
                createdAt: Joi.number().optional().valid(-1, 1).default(sorts => {
                    if (Object.keys(sorts).length === 0) return 1;
                    return undefined;
                }),
                updatedAt: Joi.number().optional().valid(-1, 1),
            })
            .min(1)
            .default()
});


/**
 *  Add Interest
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add Interest_____________________//
router.post('/add', joiValidate(addSchema), verifyTokenPanel(), uploader, authorization([{INTEREST: 'C'}]), async (req, res) => {
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
router.put('/edit', verifyTokenPanel(), uploader, authorization([{INTEREST: 'RU'}]), joiValidate(editSchema), async (req, res) => {
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
router.post('/', verifyTokenPanel(), authorization([{INTEREST: 'R'}]), joiValidate(listSchema, 0),async function (req, res) {
    // !! NOTE that joi-filtered data is now in req._body not req.body !!
    interestController.getManyPanel(req._body)
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
