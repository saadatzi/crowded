const express = require('express')
    , router = express.Router();

// Utils
const NZ = require('../../utils/nz');

// Validation requirements
const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const { joiValidate, grabSettings } = require('./../utils');

// Grab controller
const bankAccountController = require('../../controllers/bankAccount');
const bankNameController = require('../../controllers/bankName');


// Grab models
const BankAccount = require('../../models/BankAccount');

// Instantiate the Device Model
const { verifyTokenPanel } = require('../../utils/validation');


// Joi valdiator schemas

const addSchema = Joi.object().keys({
    name_en: JoiConfigs.title,
    name_ar: JoiConfigs.title,
    code: JoiConfigs.title
});

const editSchema = addSchema.keys({
    id: JoiConfigs.isMongoId,
});

const deleteSchema =  Joi.object().keys({
    id: JoiConfigs.isMongoId
});

const detailSchema = deleteSchema;


const listSchema = JoiConfigs.schemas.list({
    filters:{
        status: Joi.number().valid(0, 1, 2).default(1)
    },
    sorts:{
        createdAt: Joi.number().valid(-1,1),
        title_en: Joi.number().valid(-1,1),
        title_ar: Joi.number().valid(-1,1),
    },
    defaultSorts:{
        createdAt: -1
    }
});

/**
 Get Bank Names
*/
//TODO add  authorization([{BANK: 'R'}]),
//TODO please use promise .catch & .then | use log.error important in catch
//TODO joiValidate first middleware If possible & accessKey zero(0) not need, use(default value is 0)
router.post('/name', verifyTokenPanel(), grabSettings(), joiValidate(listSchema, 0), async (req, res) => {
    let bankNames = await bankNameController.getListPanel(req._body);
    new NZ.Response(bankNames).send(res);
});

/**
 Get Bank Names
*/
router.get('/name/:id', joiValidate(detailSchema, 2), verifyTokenPanel(), async (req, res) => {
    let bankNames = await bankNameController.getOnePanel(req.params.id);
    new NZ.Response(bankNames).send(res);
});


/**
 Add Bank Name
*/
router.post('/name/add', verifyTokenPanel(), joiValidate(addSchema, 0), async (req, res) => {
    let bankName = await bankNameController.add(req._body);
    new NZ.Response({id:bankName._id}, "Successfully added bank name!").send(res);
});


/**
 Add Bank Name
*/
router.put('/name/edit', verifyTokenPanel(), joiValidate(editSchema), async (req, res) => {
    let bankName = await bankNameController.edit(req._body);
    new NZ.Response("Successfully edited bank name!").send(res);
});


/**
 Delete Bank Name
*/
router.delete('/name', verifyTokenPanel(), joiValidate(deleteSchema, 0), async (req, res) => {

    // TODO : should i check?
    // let flag = await BankAccount.bankNameIsRelated(req.body.id);
    // if (flag) {
    //     new NZ.Response(null,"Cannot remove bankName since it's related to some bank accounts!").send(res); 
    // }

    let bankName = await bankNameController.delete(req.body.id);
    if(bankName) new NZ.Response("Successfully deleted bank name!").send(res);
    else  new NZ.Response("Failed to remove bank name!", 500).send(res);
});





// /**
//  Add Bank Account
//  */
// router.post('/account/add', joiValidate(addSchema, 0), verifyToken(true), async function (req, res) {
//     bankAccountController.add(req.userId, req.body)
//         .then(result => {
//             console.info("***User BankAccount inserted : %j", result);
//             new NZ.Response(null, 'Bank account has been successfully added!').send(res);
//         })
//         .catch(err => {
//             console.error("Add bank account catch err:", err)
//             new NZ.Response(null, err.message, 500).send(res);
//         })

// });


// /**
//  Delete Bank Account
//  */
// router.post('/account/delete', verifyToken(true), async function (req, res) {
//     let id = req.body.id;
//     return bankAccountController.changeStatus(id, 0)
//         .then(result => { new NZ.Response(null,"BankAccount deleted successfully").send(res)})
//         .catch(err => {
//             console.error("Get bank accounts catch err:", err)
//             new NZ.Response(null, err.message, 500).send(res);
//         })

// });

module.exports = router;
