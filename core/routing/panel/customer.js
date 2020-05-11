const express = require('express')
    , router = express.Router();

// Utils
const NZ = require('../../utils/nz');

// Validation requirements
const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate } = require('./../utils');

// Grab controller
const userController = require('../../controllers/user');

const { verifyTokenPanel } = require('../../utils/validation');


// Joi validator schemas
const userListSchema = JoiConfigs.schemas.list({
    filters: {
        status: Joi.number().valid(0, 1).optional()
    },
    sorts:{
        createdAt: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        lastInteract: -1
    }
});

const detailSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId,
});

const eventListSchema = JoiConfigs.schemas.list({
    filters: {
        status:     Joi.string().valid('APPROVED', 'REJECTED', 'ACTIVE', 'LEFT', 'PAUSED', 'SUCCESS').required()
    },
    sorts:{
        createdAt:  Joi.number().valid(-1,1),
        updatedAt:  Joi.number().valid(-1,1),
    },
    defaultSorts:{
        lastInteract: -1
    }
});


/**
 Get users (customers)
*/
router.post('/', joiValidate(userListSchema), verifyTokenPanel(), async (req, res) => {
    userController.getManyPanel(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{

            new NZ.Response(null,err.message,err.code).send(res);
        });
});


/**
 Get user detail (customer)
*/
router.get('/:id', joiValidate(detailSchema, 2), verifyTokenPanel(), async (req, res) => {
    userController.getOnePanel(req.params)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});


/**
 Get users events (customers)
 */
router.post('/', joiValidate(eventListSchema), verifyTokenPanel(), async (req, res) => {
    userController.getManyPanel(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});



module.exports = router;
