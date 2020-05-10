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


// Grab models
const User = require('../../models/User');

// Instantiate the Device Model
const { verifyTokenPanel } = require('../../utils/validation');


// Joi valdiator schemas

const listSchema = JoiConfigs.schemas.list({
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


/**
 Get users (customers)
*/
router.post('/', verifyTokenPanel(), joiValidate(listSchema, 0), async (req, res) => {
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
router.get('/:id', verifyTokenPanel(), joiValidate(detailSchema, 2), async (req, res) => {
    userController.getOnePanel(req.params)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err=>{
            new NZ.Response(null,err.message,err.code).send(res);
        });
});




module.exports = router;
