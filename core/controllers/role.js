/**
 * Module dependencies.
 */
let Role = require('../models/Role');

const adminController = require('./admin');

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
                console.error("!!!Role save failed: ", err);
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
 * get Admin permissions
 *
 * @param {Array} roleIds
 */
roleController.prototype.getAdmin = async (roleIds) => {
    return await Role.getAdminPermissions(roleIds)
        .then(result => result)
        .catch(err => {
            console.error("!!!Role Admin permissions failed: ", err);
            throw err;
        })
};


/**
 * remove Role
 *
 * @param {ObjectId} roleId
 */
roleController.prototype.remove = async (roleId) => {
    return await adminController.checkAssign(roleId)
        .then(async isAssigned => {
            if (isAssigned) throw {code: 400, message: 'Couldn`t remove! this role assigned to Admin.'};
            let newStatus = 2;
            return await Role.setStatus(roleId, 2, oldStatus => oldStatus !== newStatus)
                // .then(result => result)
                .catch(err => {
                    console.error("!!!Role Remove failed: ", err);
                    throw err;
                });
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
            return await Role.findByIdAndUpdate(optFilter, newValue)
                // .then(result => result)
                .catch(err => {
                    console.error("!!!Role Update by id failed: ", err);
                    // if (err.code === 11000) throw {message: "The entered title is duplicated!", code: 424};
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
