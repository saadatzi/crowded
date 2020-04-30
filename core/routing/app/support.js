const express = require('express')
    , router = express.Router();

const Joi = require('@hapi/joi');

// Instantiate the Device Model
const supportController = require('../../controllers/support');
const userController = require('../../controllers/user');
const deviceController = require('../../controllers/device');
const NZ = require('../../utils/nz');
const {verifyToken} = require('../../utils/validation');

/**
 *  Add Support
 * -add Support in db
 * @return status
 */
//______________________Add Support_____________________//
router.post('/add', verifyToken(true), async (req, res) => {
    console.info('API: Add support/init %j', {body: req.body});
    new NZ.Response(true, 'Your message has been successfully submitted!').send(res);
});

/**
 * Get Support
 * @return list of support
 */
//______________________Get Support_____________________//
router.get('/faq', verifyToken(true), async function (req, res) {
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
