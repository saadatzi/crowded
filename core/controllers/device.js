/**
 * Module dependencies.
 */
let Device = require('../models/Device');


const deviceController = function () {
};

/**
 * Add new Device
 *
 * @param {Object} newDevice
 *
 * @return {ObjectId} deviceId
 */
deviceController.prototype.add = async function (newDevice) {
    if (Array.isArray(newDevice)) { //newInterest instanceof Array
        return await Device.insertMany(newDevice)
            .then(device => {
                console.log("***device many save success result", device);
                return device;
            })
            .catch(err => {
                console.error("!!!device many save failed: ", err);
                throw err;
            })
    } else {
        return await Device.create(newDevice)
            .then(device => {
                console.log("***device save success result._id", device);
                return device;
            })
            .catch(err => {
                console.error("!!!device save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Device
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Interest
 */
deviceController.prototype.get = async (optFilter, type = 'identifier') => {
    if (!optFilter || optFilter instanceof Object) {
        return await Device.getAll(optFilter)
            .then(result => {
                console.log("***Device get All result: ", result);
                return result;
            })
            .catch(err => {
                console.error("!!!Device getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'identifier') {
            return await Device.getByIdentifier(optFilter)
                .then(result => {
                    console.log(`***Device get by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Device get failed: ", err);
                    throw err;
                });
        } else if (type === 'id') {
            return await Device.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!Device get failed: ", err);
                    throw err;
                })
        } else if (type === 'token') {
            return await Device.getByToken(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!Device get byToken failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * get Device Notification
 *
 * @param {ObjectId}  userId
 *
 * @return notificationId
 */
deviceController.prototype.getNotificationId = async (userId) => {
        return await Device.findOne({userId: userId})
            .then(device => device.notificationToken)
            .catch(err => {
                console.error("!!!Device getNotificationId failed: ", err);
                throw err;
            })
};

/**
 * remove Device (by id or filtered)
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
deviceController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Device.remove(optFilter)
                .then(result => {
                    console.log("***Device  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Device Remove failed: ", err);
                    throw err;
                })
        } else {
            return await Device.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Device Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Device Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Device
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
deviceController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Device.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Device  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Device Update many failed: ", err);
                    throw err;
                })
        } else {
            return await Device.findByIdAndUpdate(optFilter, newValue)
                .then(result => result)
                .catch(err => {
                    console.error("!!!Device Update failed: ", err);
                    throw err;
                })
        }

    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new deviceController();
