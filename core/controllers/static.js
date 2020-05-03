/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Staticpage = require('../models/Staticpage');
const moment = require('moment-timezone');

const staticController = function () {
};



/**
 *
 * @param {Object} id
 *
 * @return Events
 */
staticController.prototype.getById = async (id) => {

    return await Staticpage.getById(id)
        .catch(err => {
            console.error("!!!Static getById failed: ", err);
            throw err;
        })
};


/**
 *
 * @param {Object} alias
 *
 * @return Events
 */
staticController.prototype.getByAlias = async (alias) => {

    return await Staticpage.getByAlias(alias)
        .catch(err => {
            console.error("!!!Static getByAlias failed: ", err);
            throw err;
        })
};


/**
 *
 * @param {Object} optFilter
 *
 * @return Events
 */
staticController.prototype.list = async (optFilter) => {

    return await Staticpage.list(optFilter)
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
staticController.prototype.update = async (payload) => {

    let toUpdate = {};
    payload.name_en ? toUpdate.name_en = payload.name_en : null;
    payload.name_ar ? toUpdate.name_ar = payload.name_ar : null;
    payload.html_en ? toUpdate.html_en = payload.html_en : null;
    payload.html_ar ? toUpdate.html_ar = payload.html_ar : null;
    payload.in_app !== undefined ? toUpdate.in_app = payload.in_app : null;

    return await Staticpage.findByIdAndUpdate(payload.id, toUpdate)
        .catch(err => {
            console.error("!!!Static update failed: ", err);
            throw err;
        })
};


module.exports = new staticController();
