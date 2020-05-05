/**
 * Module dependencies.
 */
const Permission = require('../models/Permission');


const permissionController = function () {
};

/**
 * Add new Permission
 *
 * @param {Object || Array} newPermission
 *
 * @return {ObjectId} permissionId
 */
permissionController.prototype.add = async (newPermission) => {
    if (Array.isArray(newPermission)) { //newPermission instanceof Array
        return await Permission.insertMany(newPermission)
            .then(result => {
                console.log("***Permission many save success result", result);
                return result;
            })
            .catch(err => {
                console.error("!!!Permission many save failed: ", err);
                throw err;
            })
    } else {
        return await Permission.create(newPermission)
            .then(result => {
                console.log("***Permission save success result._id", result);
                return result;
            })
            .catch(err => {
                console.error("!!!Permission save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Permission
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Permission
 */
permissionController.prototype.get = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //newPermission instanceof Array
        return await Permission.list()
            .then(permissions => permissions)
            .catch(err => {
                console.error("!!!Permission getAll failed: ", err);
                throw err;
            })
    } else {
        return await Permission.get(optFilter)
            .then(result => {
                console.log(`***Permission get by id ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.error("!!!Permission get failed: ", err);
                throw err;
            })
    }
};

/**
 * remove Permission
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
permissionController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Permission.remove(optFilter)
                .then(result => {
                    console.log("***Permission  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Permission Remove failed: ", err);
                    throw err;
                })
        } else {

            return await Permission.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Permission Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Permission Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Permission
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
permissionController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Permission.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Permission  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Permission Update failed: ", err);
                    throw err;
                })
        } else {

            return await Permission.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Permission Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Permission Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new permissionController();
