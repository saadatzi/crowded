/**
 * Module dependencies.
 */

let Admin = require('../models/Admin');

const adminController = function () {
};

/**
 * Login User Panel
 *
 * @param {String} email
 * @param {String} pass
 *
 * @return {Admin} admin
 */
adminController.prototype.auth = async (email, pass) => {

    return await Admin.getAuthenticated(email, pass)
        .then(admin => {
            console.log("***Login Admin success admin", admin);
            return admin;
        })
        .catch(err => {
            console.log("!!!Login Admin failed: ", err);
            throw err;
        })
};


/**
 * Add new Admin
 *
 * @param {Object || Array} newAdmin
 *
 * @return {ObjectId} interestId
 */
adminController.prototype.add = async (newAdmin) => {
    if (Array.isArray(newAdmin)) { //newAdmin instanceof Array
        return await Admin.insertMany(newAdmin)
            .then(result => {
                console.log("***Admin many save success result", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Admin many save failed: ", err);
                throw err;
            })
    } else {
        return await Admin.create(newAdmin)
            .then(admin => {
                console.log("*** Admin save success admin", admin);
                return admin;
            })
            .catch(err => {
                console.log("!!!Admin save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Admin
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Admin
 */
adminController.prototype.get = async (optFilter, type = 'email') => {
    console.log("***Admin get by Id optFilter 2: ", optFilter);
    if (!optFilter || optFilter instanceof Object) { //newAdmin instanceof Array
        return await Admin.getAll(optFilter)
            .then(result => {
                console.log("***Admin get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Admin getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await Admin.getByEmail(optFilter)
                .then(result => result)
                .catch(err => {
                    console.log("!!!Admin getByEmail failed: ", err);
                    throw err;
                })
        } else {
            return await Admin.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.log("!!!Admin get failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * remove Admin
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
adminController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Admin.remove(optFilter)
                .then(result => {
                    console.log("***Admin  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Admin Remove failed: ", err);
                    throw err;
                })
        } else {

            return await Admin.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Admin Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Admin Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Admin
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
adminController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Admin.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Admin  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Admin Update failed: ", err);
                    throw err;
                })
        } else {
            return await Admin.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Admin Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Admin Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new adminController();
