/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const moment = require('moment-timezone');

const settingController = function () {
};


/**
 * Add new Settings
 *
 * @param {Object || Array} newSetting
 *
 * @return {ObjectId} settings
 */
settingController.prototype.add = async (newSetting) => {
    if (Array.isArray(newSetting)) { //newOrganization instanceof Array
        return await Setting.insertMany(newSetting)
            .catch(err => {
                console.error("!!!Settings many save failed: ", err);
                throw err;
            })
    } else {
        return await Setting.create(newSetting)
            .catch(err => {
                console.error("!!!Settings save failed: ", err);
                throw err;
            })
    }
};

/**
 *
 * @param {Object} id
 *
 * @return Settings
 */
settingController.prototype.getById = async (id) => {

    return await Setting.getById(id)
        .catch(err => {
            console.error("!!!Setting getById failed: ", err);
            throw err;
        })
};

/**
 *
 * @param {Object} optFilter
 *
 * @return Settings
 */
settingController.prototype.get = async (optFilter) => {
    return await Setting.find(optFilter)
        .then(settings => settings)
        .catch(err => {
            console.error("!!!Setting get failed: ", err);
            throw err;
        })
};

/**
 *
 * @param {Object} key
 *
 * @return Settings
 */
settingController.prototype.getByKey = async (key) => {

    return await Setting.getByKey(key)
        .catch(err => {
            console.error("!!!Setting getByKey failed: ", err);
            throw err;
        })
};


/**
 *
 * @param {Object} optFilter
 *
 * @return Settings
 */
settingController.prototype.list = async (optFilter) => {

    return await Setting.list(optFilter)
        .catch(err => {
            console.error("!!!Static list failed: ", err);
            throw err;
        })
};

/**
 *
 * @param {Object} 
 *
 * @return Settings
 */
settingController.prototype.update = async (payload) => {

    let toUpdate = {};
    payload.value ? toUpdate.value = payload.value : null;

    return await Setting.findByIdAndUpdate(payload.id, toUpdate)
        .catch(err => {
            console.error("!!!setting update failed: ", err);
            throw err;
        })
};


module.exports = new settingController();
