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
            .then(result => result)
            .catch(err => {
                console.error("!!!Role many save failed: ", err);
                throw err;
            })
    } else {
        return await Role.create(newRole)
            .then(role => role)
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
roleController.prototype.get = async (optFilter, type = 'id') => {
    if (!optFilter || optFilter instanceof Object) { //newRole instanceof Array
        return await Role.list(optFilter)
            .then(result => result)
            .catch(err => {
                console.error("!!!Role getAll failed: ", err);
                throw err;
            })
    } else {
        return await Role.getById(optFilter)
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error("!!!Role get failed: ", err);
                throw err;
            })
    }
};

/**
 * remove Role
 *
 * @param {ObjectId} roleId
 */
roleController.prototype.remove = async (roleId) => {
    let newStatus = 2;
    return await Role.setStatus(roleId,2,oldStatus=>oldStatus!==newStatus)
        .then(result => {
            console.log(`***Role Remove by id ${roleId} result: `, result);
            return result;
        })
        .catch(err => {
            console.error("!!!Role Remove failed: ", err);
            throw err;
        });
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
                    console.error("!!!Role updateMany failed: ", err);
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
                    console.error("!!!Role Update by id failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

/**
 * authorize Role
 *
 * @param {ObjectId} userId
 * @param {Array} permissions
 *
 * @return {Boolean} hsaRoleTrueFalse
 */
roleController.prototype.authorize = async (userId, permissions) => {
    return await Role.authorize(userId, permissions)
        .then(result => {
            console.warn(">>>>>>>>>>>>>>>>>Need Role => %j result => %j", permissions, result);
            return result;
        })
        .catch(err => {
            console.error("!!!Role Authorize failed: ", err);
            throw err;
        });
};

module.exports = new roleController();
