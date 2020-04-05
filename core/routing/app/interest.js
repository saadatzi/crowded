const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const logger = require('../../utils/winstonLogger');
const Joi = require('@hapi/joi');

// Instantiate the Device Model
const interestController = require('../../controllers/interest');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');

/**
 *  Add Interest
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add Interest_____________________//
router.put('/add', uploader, async (req, res) => {
    logger.info('API: Add interest/init %j', {body: req.body});
    if (! req._uploadPath || !req._uploadFilename) {
        return new NZ.Response(null, 'fileUpload is Empty!', 400).send(res);
    }
    // const schema = Joi.object().keys({
    //     device:	Joi.object().keys({
    //         name:		Joi.string().required(),
    //         capacity:	Joi.string().regex(/^[0-9.GB]{3,18}$/).required(),
    //         uid:		Joi.string().regex(/^[A-F0-9-]{36}$/).required(),
    //         platform:	Joi.string().required()
    //     }).required(),
    //
    //     os: Joi.object().keys({
    //         version:	Joi.string().required(),
    //         type:		Joi.string().allow('iOS', 'Android').required()
    //     }).required()
    // });
    //
    // result = schema.validate({
    //     device:	req.body.device,
    //     os:		req.body.os
    // });
    //
    // let response = {};
    //
    // if (result.error)
    //     return new NZ.Response(result.error, 'input error.', 400).send(res);

    req.body.image = req._uploadPath+'/'+req._uploadFilename;
    interestController.add(req.body)
        .then(interestId => {
            logger.info("*** interest added interest_id: %s", interestId);
        })
        .catch(err => {
            logger.error("Interest Add Catch err:", err)
            res.err(err)
        })
});

/**
 * Get Interest
 * @param showField
 * @param criteria
 * @param page
 * @param limit
 * @return list of interest
 */
//______________________Get Interest_____________________//
router.post('/list', function (req, res) {
    logger.info('API: Get interest/init');

    interestController.get({field: req.body.showField || `title_${req.headers['accept-language']} image`})
        .then(result => {
            logger.info("*** interest List : %j", result);
            new NZ.Response({
                items:  result,
            }).send(res);
        })
        .catch(err => {
            logger.error("Interest Get Catch err:", err)
            // res.err(err)
        })
});


module.exports = router;
