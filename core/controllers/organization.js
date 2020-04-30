/**
 * Module dependencies.
 */
let Organization = require('../models/Organization');

const organizationController = function () {};

/**
 * Add new Organization
 *
 * @param {Object || Array} newOrganization
 *
 * @return {ObjectId} interestId
 */
organizationController.prototype.add = async (newOrganization) => {
    if (Array.isArray(newOrganization)) { //newOrganization instanceof Array
        return await Organization.insertMany(newOrganization)
            .catch(err => {
                console.log("!!!Organization many save failed: ", err);
                throw err;
            })
    } else {
        return await Organization.create(newOrganization)
            .catch(err => {
                console.log("!!!Organization save failed: ", err);
                if (err.code === 11000) throw {message: "The entered title is duplicated!", code: 424};
                throw err;
            })
    }
};

/**
 * get Organization
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Organization
 */
organizationController.prototype.get = async (optFilter, type = 'id') => {
    console.log("***Organization get by Id optFilter 2: ", optFilter);
    if (!optFilter || optFilter instanceof Object) { //newOrganization instanceof Array
        return await Organization.getAll(optFilter)
            .then(result => {
                console.log("***Organization get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Organization getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'id') {
            console.log("***Organization get by Id optFilter 3: ", optFilter);
            return await Organization.getById(optFilter)
                .then(result => {
                    console.log(`***Organization get by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Organization get failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * remove Organization
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
organizationController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Organization.remove(optFilter)
                .then(result => {
                    console.log("***Organization  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Organization Remove failed: ", err);
                    throw err;
                })
        } else {

            return await Organization.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Organization Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Organization Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Organization
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
organizationController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Organization.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Organization  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Organization Update failed: ", err);
                    throw err;
                })
        } else {
            return await Organization.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Organization Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Organization Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};


/**
 * Panel get all organizations
 *
 * @return Organizations
 */
organizationController.prototype.getManyPanel = async (optFilter) => {

    return await Organization.getManyPanel(optFilter)
        .catch(err => {
            console.log("!!!Organization getAllPanel failed: ", err);
            throw err;
        });
};


module.exports = new organizationController();
