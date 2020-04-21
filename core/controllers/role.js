/**
 * Module dependencies.
 */
let Role = require('../models/Role');

const roleController = function () {};

/**
 * Add new Role
 *
 * @param {Object || Array} newRole
 *
 * @return {ObjectId} interestId
 */
roleController.prototype.add = async (newRole) => {
    if (Array.isArray(newRole)) { //newRole instanceof Array
        return await Role.insertMany(newRole)
            .then(room => {
                console.log("***Role many save success room", room);
                return room;
            })
            .catch(err => {
                console.log("!!!Role many save failed: ", err);
                throw err;
            })
    } else {
        return await Role.create(newRole)
            .then(role => {
                console.log("*** Role save success role", role);
                return role;
            })
            .catch(err => {
                console.log("!!!Role save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Role
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Role
 */
roleController.prototype.get = async (optFilter, type = 'email') => {
    console.log("***Role get by Id optFilter 2: ", optFilter);
    if (!optFilter || optFilter instanceof Object) { //newRole instanceof Array
        return await Role.getAll(optFilter)
            .then(result => {
                console.log("***Role get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Role getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await Role.getByEmail(optFilter)
                .then(result => result)
                .catch(err => {
                    console.log("!!!Role getByEmail failed: ", err);
                    throw err;
                })
        } else {
            console.log("***Role get by Id optFilter 3: ", optFilter);
            return await Role.getById(optFilter)
                .then(result => {
                    console.log(`***Role get by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Role get failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * remove Role
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
roleController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            //ToDo return Query?!
            return await Role.remove(optFilter)
                .then(result => {
                    console.log("***Role  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Role Remove failed: ", err);
                    throw err;
                })
        } else {
            //ToDo return Query?!
            return await Role.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Role Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Role Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Role
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
roleController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Role.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Role  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Role Update failed: ", err);
                    throw err;
                })
        } else {
            return await Role.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Role Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Role Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new roleController();
