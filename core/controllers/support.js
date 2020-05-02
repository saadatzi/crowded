/**
 * Module dependencies.
 */
let Support = require('../models/Support');

const supportController = function () {
};

/**
 * Add new Support
 *
 * @param {Object || Array} newSupport
 *
 * @return {ObjectId} interestId
 */
supportController.prototype.add = async (newSupport) => {
    if (Array.isArray(newSupport)) { //newSupport instanceof Array
        return await Support.insertMany(newSupport)
            .then(result => {
                console.log("***Support many save success result", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Support many save failed: ", err);
                throw err;
            })
    } else {
        return await Support.create(newSupport)
            .then(support => {
                console.log("*** Support save success support", support);
                return support;
            })
            .catch(err => {
                console.log("!!!Support save failed: ", err);
                if (err.code === 11000) throw {message: "The entered title is duplicate!", code: 424};
                throw err;
            })
    }
};

/**
 * get Support
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Support
 */
supportController.prototype.get = async (optFilter, type = 'id') => {
    if (!optFilter || optFilter instanceof Object) { //newSupport instanceof Array
        return await Support.list(optFilter)
            .then(result => {
                console.log("***Support get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Support getAll failed: ", err);
                throw err;
            })
    } else {
        console.log("***Support get by Id optFilter 3: ", optFilter);
        return await Support.getById(optFilter)
            .then(result => {
                console.log(`***Support get by id ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.log("!!!Support get failed: ", err);
                throw err;
            })
    }
};

/**
 * remove Support
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
supportController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Support.remove(optFilter)
                .then(result => {
                    console.log("***Support  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Support Remove failed: ", err);
                    throw err;
                })
        } else {

            return await Support.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Support Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Support Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Support
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
supportController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Support.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Support  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Support updateMany failed: ", err);
                    throw err;
                })
        } else {
            const updateValue = {permissions: newValue}
            return await Support.findByIdAndUpdate(optFilter, updateValue)
                .then(result => {
                    console.log(`***Support Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Support Update by id failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

/**
 * authorize Support
 *
 * @param {ObjectId} userId
 * @param {Array} permissions
 *
 * @return {Boolean} hsaSupportTrueFalse
 */
supportController.prototype.authorize = async (userId, permissions) => {
    let conceptualization = [];
    let perName = [];
    let perValue = [];
    permissions.map(per => {
        perName.push(Object.keys(per)[0]);
        perValue.push(Object.values(per)[0])
    });
    return await Support.authorize(userId, permissions, perName, perValue)
        .then(result => {
            console.log("***Support  authorize Controller: ", result);
            return result;
        })
        .catch(err => {
            console.log("!!!Support Authorize failed: ", err);
            throw err;
        });
};

module.exports = new supportController();
