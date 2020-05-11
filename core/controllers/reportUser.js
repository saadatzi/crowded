/**
 * Module dependencies.
 */

let ReportUser = require('../models/ReportUser');

const reportUserController = function () {
};

/**
 * Add new ReportUser
 *
 * @param {Object || Array} newReportUser
 *
 * @return {ObjectId} interestId
 */
reportUserController.prototype.add = async (newReportUser) => {
    if (Array.isArray(newReportUser)) { //newReportUser instanceof Array
        return await ReportUser.insertMany(newReportUser)
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error("!!!ReportUser many save failed: ", err);
                throw err;
            })
    } else {
        return await ReportUser.create(newReportUser)
            .then(reportUser => {
                console.log("*** ReportUser save success reportUser", reportUser);
                return reportUser;
            })
            .catch(err => {
                console.error("!!!ReportUser save failed: ", err);
                throw err;
            })
    }
};

/**
 * get ReportUser
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return ReportUser
 */
reportUserController.prototype.get = async (optFilter, type = 'email') => {
    if (!optFilter || optFilter instanceof Object) { //newReportUser instanceof Array
        return await ReportUser.getAll(optFilter)
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error("!!!ReportUser getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await ReportUser.getByEmail(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!ReportUser getByEmail failed: ", err);
                    throw err;
                })
        } else {
            return await ReportUser.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!ReportUser get failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * ReportUser getManyPanel
 *
 * @param {Object} optFilter
 *
 * @return {Object} {explain + items}
 */
reportUserController.prototype.getManyPanel = async (optFilter) => {
    return await ReportUser.getManyPanel(optFilter)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error("!!!ReportUser getManyPanel failed: ", err);
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
reportUserController.prototype.checkAssign = async (roleId) => {
    return await ReportUser.roleIsRelated(roleId)
        .then(result => result)
        .catch(err => {
            console.error("!!!ReportUser checkAssign failed: ", err);
            throw err;
        });
};


/**
 * ReportUser getOnePanel
 *
 * @param {ObjectId} reportUserId
 *
 */
reportUserController.prototype.getOnePanel = async (reportUserId) => {
    return await ReportUser.getOnePanel(reportUserId)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error("!!!ReportUser getOnePanel failed: ", err);
            throw err;
        });
};

/**
 * remove ReportUser
 *
 * @param {ObjectId} id
 *
 * @return Query
 */
reportUserController.prototype.remove = async (id) => {
    let newStatus = 2;
    return await ReportUser.setStatus(id,2,oldStatus=>oldStatus!==newStatus)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error(`!!!ReportUser Remove failed for id ${id}: `, err);
            throw err;
        });
};

/**
 * Update ReportUser
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
reportUserController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await ReportUser.updateMany(optFilter, newValue)
                .then(result => {
                    return result;
                })
                .catch(err => {
                    console.error("!!!ReportUser Update failed: ", err);
                    throw err;
                })
        } else {
            return await ReportUser.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    return result;
                })
                .catch(err => {
                    console.error("!!!ReportUser Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw { errMessage: 'for Update Object conditions or Id is required!' }
    }


};

module.exports = new reportUserController();
