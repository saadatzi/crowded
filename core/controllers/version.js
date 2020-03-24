const express = require('express')
    , router = express.Router();

const logger = require('../utils/winstonLogger');

/*------Android Version-------*/
const ANDROID_VERSION = {
    bazzar      : 1,
    myket       : 1,
    bazartrip  : 1
};
const ANDROID_LINK = {
    bazzar      : 'https://cafebazaar.ir/app/ir.bazartrip',
    myket       : 'https://myket.ir/app/ir.bazartrip',
    bazartrip  : 'https://www.bazartrip.ir/app'
};

/*------IOS Version-------*/
const IOS_VERSION = {
    sibApp      : 1,
    anardoni    : 1,
    iapps       : 1,
    bazartrip  : 1
};
const IOS_LINK = {
    sibApp      : 'https://sibapp.com/applications/...',
    anardoni    : 'https://anardoni.com/ios/app/...',
    iapps       : 'https://iapps.ir/app/...',
    bazartrip  : 'https://www.bazartrip.ir/app'
};


router.get('/android/:flavorName/:currentVersion', function (req, res) {
    logger.info('API: version/Android %j', {params: req.params});
    if (parseInt(req.params.currentVersion) < ANDROID_VERSION[req.params.flavorName]) {
        res.set({newVersion: 1, url: ANDROID_LINK[req.params.flavorName]}).send();
    } else {
        res.set({newVersion: 0}).send();
    }
});

router.get('/ios/:flavorName/:currentVersion', function (req, res) {
    logger.info('API: version/IOS %j', {body: req.params});
    if (parseInt(req.params.currentVersion) < IOS_VERSION[req.params.flavorName]) {
        res.set({newVersion: 1, url: IOS_LINK[req.params.flavorName]}).send();
    } else {
        res.set({newVersion: 0}).send();
    }
});


module.exports = router;
