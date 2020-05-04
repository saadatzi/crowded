const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');
const JoiConfigs = require('../joiConfigs');
const {joiValidate} = require('../utils');



// Instantiate the Device Model
const supportController = require('../../controllers/support');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyToken} = require('../../utils/validation');

// Models
const User = require('../../models/User');



const addSchema = Joi.object().keys({
    message: JoiConfigs.strOptional,
    name: JoiConfigs.title,
});

/**
 *  Add Support
 * -add Support in db
 * @return status
 */
//______________________Add Support_____________________//
router.post('/add', verifyToken(),  async (req, res) => {
    console.info('API: Add support/init %j', {body: req.body});
    let payload = {
        message: req.body.message,
        name: req.body.name,
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
        .then((ha)=>{
            new NZ.Response(null, 'Your message has been successfully submitted!').send(res);
        })
        .catch(err=>{
            return console.error(err);
            new NZ.Response(null, err.message, err.code).send(res);
        });
    
   
});

/**
 * Get Support
 * @return list of support
 */
//______________________Get Support_____________________//
router.get('/faq', verifyToken(), async function (req, res) {
    console.info('API: Get support/init');

    const mockSupport = [
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
    ]
    new NZ.Response({items:  mockSupport}).send(res);
});

module.exports = router;
