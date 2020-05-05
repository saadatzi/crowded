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
            return admin;
        })
        .catch(err => {
            console.error("!!!Login Admin failed: ", err);
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
                return result;
            })
            .catch(err => {
                console.error("!!!Admin many save failed: ", err);
                throw err;
            })
    } else {
        return await Admin.create(newAdmin)
            .then(admin => {
                console.log("*** Admin save success admin", admin);
                return admin;
            })
            .catch(err => {
                console.error("!!!Admin save failed: ", err);
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
    if (!optFilter || optFilter instanceof Object) { //newAdmin instanceof Array
        return await Admin.getAll(optFilter)
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error("!!!Admin getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await Admin.getByEmail(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!Admin getByEmail failed: ", err);
                    throw err;
                })
        } else {
            return await Admin.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!Admin get failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * Admin getManyPanel
 *
 * @param {Object} optFilter
 *
 * @return {Object} {explain + items}
 */
adminController.prototype.getManyPanel = async (optFilter) => {
    return await Admin.getManyPanel(optFilter)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error("!!!Admin getManyPanel failed: ", err);
            throw err;
        });
};

/**
 * Check role Assign
 *
 * @param {ObjectId} roleId
 *
 * @return {Boolean} isAssigned
 */
adminController.prototype.checkAssign = async (roleId) => {
    return await Admin.roleIsRelated(roleId)
        .then(result => result)
        .catch(err => {
            console.error("!!!Admin checkAssign failed: ", err);
            throw err;
        });
};


/**
 * Admin getOnePanel
 *
 * @param {Object} optFilter
 *
 */
adminController.prototype.getOnePanel = async (optFilter) => {
    return await Admin.getOnePanel(optFilter)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error("!!!Admin getOnePanel failed: ", err);
            throw err;
        });
};

/**
 * remove Admin
 *
 * @param {ObjectId} id
 *
 * @return Query
 */
adminController.prototype.remove = async (id) => {
    let newStatus = 2;
    return await Admin.setStatus(id,2,oldStatus=>oldStatus!==newStatus)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error(`!!!Admin Remove failed for id ${id}: `, err);
            throw err;
        });
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
                    return result;
                })
                .catch(err => {
                    console.error("!!!Admin Update failed: ", err);
                    throw err;
                })
        } else {
            return await Admin.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    return result;
                })
                .catch(err => {
                    console.error("!!!Admin Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw { errMessage: 'for Update Object conditions or Id is required!' }
    }


};

module.exports = new adminController();
