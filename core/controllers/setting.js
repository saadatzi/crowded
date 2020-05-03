/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const moment = require('moment-timezone');

const settingController = function () {
};



/**
 *
 * @param {Object} id
 *
 * @return Events
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
 * @param {Object} key
 *
 * @return Events
 */
settingController.prototype.getByKey = async (key) => {

    return await Staticpage.getByKey(key)
        .catch(err => {
            console.error("!!!Setting getByKey failed: ", err);
            throw err;
        })
};


/**
 *
 * @param {Object} optFilter
 *
 * @return Events
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
 * @return Events
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
