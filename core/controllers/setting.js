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
 * @return Setting
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
 * @param {String} key
 *
 * @return Setting
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
 * @param {Array} settings
 *
 * @return Settings
 */
settingController.prototype.update = async (settings) => {
    return Promise.all(settings.map(async setting => {
        return await Setting.findByIdAndUpdate(setting.id, {value: setting.value})
            .catch(err => {
                console.error("!!!setting update failed: ", err);
                throw err;
            })
    }))

};


module.exports = new settingController();
