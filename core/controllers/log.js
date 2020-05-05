/**
 * Module dependencies.
 */
let Log = require('../models/Log');

const logController = function () {};

/**
 * Add new Log
 *
 * @param {Log} newLog
 *
 * @return {Log} log
 */
logController.prototype.add = async (newLog) => {
    return await Log.create(newLog)
        .then(log => log)
        .catch(err => {
            console.error("!!!Log save failed: ", err);
            throw err;
        })
};

/**
 * get Log
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Log
 */
logController.prototype.get = async (optFilter, type = 'email') => {
    if (!optFilter || optFilter instanceof Object) { //newLog instanceof Array
        return await Log.getAll(optFilter)
            .then(result => {
                console.log("@@@Log get All result: ", result);
                return result;
            })
            .catch(err => {
                console.error("!!!Log getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await Log.getByEmail(optFilter)
                .then(result => {
                    console.log(`@@@Log getByEmail ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Log getByEmail failed: ", err);
                    throw err;
                })
        } else {
            return await Log.get(optFilter)
                .then(result => {
                    console.log(`@@@Log get by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Log get failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * remove Log
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
logController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Log.remove(optFilter)
                .then(result => {
                    console.log("@@@Log  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Log Remove failed: ", err);
                    throw err;
                })
        } else {

            return await Log.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`@@@Log Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Log Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Log
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
logController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Log.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("@@@Log  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Log Update failed: ", err);
                    throw err;
                })
        } else {

            return await Log.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`@@@Log Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Log Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new logController();
