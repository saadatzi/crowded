/**
 * Module dependencies.
 */
const Interest = require('../models/Interest');


const interestController = function () {
};

/**
 * Add new Interest
 *
 * @param {Object || Array} newInterest
 *
 * @return {ObjectId} interestId
 */
interestController.prototype.add = async (newInterest) => {
    if (Array.isArray(newInterest)) { //newInterest instanceof Array
        return await Interest.insertMany(newInterest)
            .then(result => {
                console.log("***Interest many save success result", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Interest many save failed: ", err);
                throw err;
            })
    } else {
        return await Interest.create(newInterest)
            .then(result => {
                console.log("***Interest save success result._id", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Interest save failed: ", err);
                throw err;
            })
    }
};



/**
 * Panel get one interest
 *
 * @return Interest
 */
interestController.prototype.getOnePanel = async (optFilter) => {

    return await Interest.getOnePanel(optFilter)
        .then(result => {
            console.log(`***Interest get by id ${optFilter} result: `, result);
            return result;
        })
        .catch(err => {
            console.log("!!!Interest get failed: ", err);
            throw err;
        })
};


/**
 * Panel get all interests
 *
 * @return Interest
 */
interestController.prototype.getManyPanel = async (optFilter) => {

    return await Interest.getManyPanel(optFilter)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.log("!!!Interest getAllPanel failed: ", err);
            throw err;
        });
};

/**
 * get Interest
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Interest
 */
interestController.prototype.get = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //newInterest instanceof Array
        return await Interest.list()
            .then(interests => {
                let returnedInterests = [];
                interests.map(interest => returnedInterests.push(interest.transform(optFilter.selected, optFilter.lang)));
                return returnedInterests;
            })
            .catch(err => {
                console.log("!!!Interest getAll failed: ", err);
                throw err;
            })
    } else {
        return await Interest.get(optFilter)
            .then(result => {
                console.log(`***Interest get by id ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.log("!!!Interest get failed: ", err);
                throw err;
            })
    }
};

/**
 * Remove Interest
 *
 * @param {String} id
 * @returns {Promise}
 *
 */
interestController.prototype.remove = async (id) => {
    let newStatus = 2;
    return await Interest.setStatus(id,2,oldStatus=>oldStatus!==newStatus)
        .then(result => {
            console.log(`***Interest Removed by id ${id} result: `, result);
            return result;
        })
        .catch(err => {
            console.log(`!!!Interest Remove failed for id ${id}: `, err);
            throw err;
        });
};

/**
 * Update Interest
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
interestController.prototype.update = async (payload) => {
    let toUpdate = {}
    payload.title_en ? toUpdate.title_en = payload.title_en : null;
    payload.title_ar ? toUpdate.title_ar = payload.title_ar : null;
    payload.order ? toUpdate.order = payload.order : null;
    payload.image ? toUpdate.image = payload.image : null;
    return await Interest.findByIdAndUpdate(payload.id, toUpdate)
        .then(result => {
            console.log(`***Interest Update by id ${payload.id} result: `, result);
            return result;
        })
        .catch(err => {
            console.log("!!!Interest Update failed: ", err);
            throw err;
        });

};

module.exports = new interestController();
