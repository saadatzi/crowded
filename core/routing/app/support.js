const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate} = require('../utils');



// Instantiate the Device Model
const supportController = require('../../controllers/support');
const faqController = require('../../controllers/faq');
const NZ = require('../../utils/nz');
const {verifyToken} = require('../../utils/validation');

// Models
const User = require('../../models/User');



const addSchema = Joi.object().keys({
    message: JoiConfigs.strOptional,
    email: JoiConfigs.email(false)
});

/**
 *  Add Support
 * -add Support in db
 * @return status
 */
//______________________Add Support_____________________//
router.post('/add', verifyToken(), joiValidate(addSchema,0), async (req, res) => {
    console.info('API: Add support/init %j', {body: req.body});
    let payload = {
        message: req.body.message,
        email: req.body.email
    }
    if(req.userId){
        let user = await User.getById(req.userId);
        if(!user) return new NZ.Response(null, "Invalid user!", 400).send(res);
        // else
        payload.email = user.email;
    }
    // if OK
    if(!payload.email) return new NZ.Response(null, "Please include your email address!", 400).send(res);

    return supportController.add(payload)
        .then(()=>{
            new NZ.Response(null, 'Your message has been successfully submitted!').send(res);
        })
        .catch(err=>{
            new NZ.Response(null, err.message, 500).send(res);
        });
    
   
});

/**
 * Get Support
 * @return list of support
 */
//______________________Get Support_____________________//
router.get('/faq', verifyToken(), async function (req, res) {
    console.info('API: Get support/init');

    faqController.getApp({})
        .then(items => {
            new NZ.Response({items}).send(res);
        })
        .catch(err=>{
            new NZ.Response(null, err.message, 500).send(res);
        });

    /*
    * const mockSupport = [
        {
            question: 'How does Crowded work?',
            answer: 'Crowded works with your GPS. As you press I’m in there button we submit your location and will change the status if you were in mentioned area.'
        },
        {
            question: 'How would I get paid?',
            answer: 'Crowded works with your GPS. As you press I’m in there button we submit your location and will change the status if you were in mentioned area.'
        },
        {
            question: 'Can I bring a friend with myself?',
                answer: 'Crowded works with your GPS. As you press I’m in there button we submit your location and will change the status if you were in mentioned area.'
        }
    ]*/
});

module.exports = router;
