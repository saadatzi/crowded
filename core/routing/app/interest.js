const express = require('express')
    , router = express.Router();
const jwtRun = require('../../utils/jwt')

const logger = require('../../utils/winstonLogger');


// Instantiate the Device Model
const InterestController = require('../../controllers/interest');
const NZ = require('../../utils/nz');
const {uploader} = require('../../utils/fileManager');

/**
 *  Add Interest
 * -upload image and save in req._uploadPath
 * -add Interest in db
 * @return status
 */
//______________________Add Interest_____________________//
router.post('/add', uploader, async (req, res) => {
    logger.info('API: Add interest/init %j', {body: req.body});
    req.body.image = req._uploadPath+'/'+req._uploadFilename;
    InterestController.add(req.body)
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
router.get('/', function (req, res) {
    logger.info('API: Get interest/init');

    InterestController.get({field: req.body.showField || `title_${req.headers['accept-language']} image`})
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
