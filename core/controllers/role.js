/**
 * Module dependencies.
 */
let Role = require('../models/Role');

const roleController = function () {
};

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
            .then(result => {
                console.log("***Role many save success result", result);
                return result;
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
                if (err.code === 11000) throw {message: "The entered title is duplicate!", code: 424};
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
    if (!optFilter || optFilter instanceof Object) { //newRole instanceof Array
        return await Role.list(optFilter)
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
                    console.log("!!!Role updateMany failed: ", err);
                    throw err;
                })
        } else {
            const updateValue = {permissions: newValue}
            return await Role.findByIdAndUpdate(optFilter, updateValue)
                .then(result => {
                    console.log(`***Role Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Role Update by id failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

/**
 * Add new Role
 *
 * @param {Array} permissions
 *
 * @return {Boolean} hsaRoleTrueFalse
 */
roleController.prototype.authorize = async (permissions) => {
    let conceptualization = [];
    permissions.map(per => {

    });
    return await Role.authorize(permissions)
        .then(result => {
            console.log("***Role many save success result", result);
            return result;
        })
        .catch(err => {
            console.log("!!!Role many save failed: ", err);
            throw err;
        })
};

module.exports = new roleController();
