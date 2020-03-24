/**
 * Module dependencies.
 */
let Device = require('../models/Device');


const DeviceController = function () {};

/**
 * Add new Device
 *
 * @param {Object} newDevice
 *
 * @return {ObjectId} deviceId
 */
DeviceController.prototype.add = async function (newDevice) {
    const device = new Device(newDevice);
    return await device.save()
        .then(room => {
            console.log("***device save success room._id", room._id);
            return room._id;
        })
        .catch(err => {
            console.log("!!!device save field: ", err);
            return -1;
        })
};

module.exports = new DeviceController();
