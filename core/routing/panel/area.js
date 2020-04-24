const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const Joi = require('@hapi/joi');

// Instantiate the Device Model
const areaController = require('../../controllers/area');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyTokenPanel} = require('../../utils/jwt');

/**
 *  Add Area
 * -add Area in db
 * @return status
 */
//______________________Add Area_____________________//
router.post('/add', verifyTokenPanel(), async (req, res) => {
    console.info('API: Add Area/init %j', {body: req.body});

    //TODO array only tmp
    const areaSchema = Joi.object().keys({
        selected: Joi.array().min(1).required()
    });
    let areaValidation = areaSchema.validate({selected: req.body});
    if (areaValidation.error)
        return new NZ.Response(areaValidation.error, 'input error.', 400).send(res);

    areaController.add(req.body)
        .then(interest => {
            new NZ.Response('', interest.length + ' Area has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Area Add Catch err:", err)
            new NZ.Response(null, res.message, err.code || 500).send(res);
        })
});

module.exports = router;
