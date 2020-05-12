/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const StaticPage = require('../models/StaticPage');
const moment = require('moment-timezone');

const staticController = function () {
};

/**
 * Add new Static
 *
 * @param {Object || Array} newStatic
 *
 * @return {ObjectId} staticPages
 */
staticController.prototype.add = async (newStatic) => {
    if (Array.isArray(newStatic)) { //newOrganization instanceof Array
        return await StaticPage.insertMany(newStatic)
            .catch(err => {
                console.error("!!!StaticPage many save failed: ", err);
                throw err;
            })
    } else {
        return await StaticPage.create(newStatic)
            .catch(err => {
                console.error("!!!StaticPage save failed: ", err);
                throw err;
            })
    }
};

/**
 *
 * @param {Object} id
 *
 * @return staticPages
 */
staticController.prototype.getById = async (id) => {

    return await StaticPage.getById(id)
        .catch(err => {
            console.error("!!!Static getById failed: ", err);
            throw err;
        })
};

/**
 *
 * @param {Object} optFilter
 *
 * @return staticPages
 */
staticController.prototype.get = async (optFilter) => {
    return await StaticPage.find(optFilter)
        .then(statics => statics)
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

    return await StaticPage.getByAlias(alias)
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

    return await StaticPage.list(optFilter)
        .catch(err => {
            console.error("!!!Static list failed: ", err);
            throw err;
        })
};

/**
 *
 * @param {Object} payload
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

    return await StaticPage.findByIdAndUpdate(payload.id, toUpdate)
        .catch(err => {
            console.error("!!!Static update failed: ", err);
            throw err;
        })
};


module.exports = new staticController();
