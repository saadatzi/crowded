const express = require('express')
    , router = express.Router();

// Instantiate the Device Model
const faqController = require('../../controllers/faq');
const NZ = require('../../utils/nz');
const {verifyTokenPanel, authorization} = require('../../utils/validation');

const Joi = require('@hapi/joi');
const {joiValidate} = require('../utils');
const JoiConfigs = require('../joiConfigs');

// Models
const Device = require('../../models/Device');
const Event = require('../../models/Event');
const User = require('../../models/User');


// Joi valdiator schemas

const hasValidIdSchema = Joi.object().keys({
    faqId: JoiConfigs.isMongoId
});

const addSchema = Joi.object().keys({
    question_ar: JoiConfigs.title,
    question_en: JoiConfigs.title,
    answer_ar: JoiConfigs.description(),
    answer_en: JoiConfigs.description(),
    order: JoiConfigs.number,
});

const editSchema = Joi.object().keys({
    faqId: JoiConfigs.isMongoId,
    question_ar: JoiConfigs.title,
    question_en: JoiConfigs.title,
    answer_ar: JoiConfigs.description(),
    answer_en: JoiConfigs.description(),
    order: JoiConfigs.number,
});


/**
 *  Add Faq
 * -add Faq in db
 * @return status
 */
//______________________Add Faq_____________________//
router.post('/add', joiValidate(addSchema), verifyTokenPanel(), authorization([{FAQ: 'C'}]), async (req, res) => {
    console.info('API: Add faq/init %j', {body: req.body});

    faqController.add(req.body)
        .then(faq => {
            new NZ.Response(true, 'Added faq successfully!').send(res);
        })
        .catch(err => {
            console.error("Faq Add Catch err:", err)
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 * Edit Faq
 */
router.put('/edit', joiValidate(editSchema), verifyTokenPanel(), authorization([{FAQ: 'RU'}]), async (req, res) => {
    faqController.update(req.body)
        .then(result => {
            new NZ.Response(null, "Faq edited successfully.").send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });
});

/**
 * Remove Faq
 */
router.delete('/', verifyTokenPanel(), joiValidate(hasValidIdSchema, 0), authorization([{FAQ: 'RD'}]), async (req, res) => {
    faqController.remove(req.body.faqId)
        .then(result => {
            new NZ.Response(null, "Faq removed successfully.").send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });

});


/**
 * Get Faqs
 * @return list of faq
 */
router.get('/', verifyTokenPanel(), authorization([{FAQ: 'R'}]), async function (req, res) {
    faqController.getPanel({}, 'panel')
        .then(items => {
            new NZ.Response({items}).send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });

});


/**
 * Get Faq for panel Detail
 * @return list of faqs
 */
router.get('/:id', verifyTokenPanel(), authorization([{FAQ: 'R'}]), async function (req, res) {

    faqController.getPanel(req.params.id)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            new NZ.Response(null, err.message, 500).send(res);
        });

});
module.exports = router;
