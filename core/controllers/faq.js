/**
 * Module dependencies.
 */
const Faq = require('../models/Faq');


const faqController = function () {
};

/**
 * Add new Faq
 *
 * @param {Object || Array} updateValue
 *
 * @return {ObjectId} faqId
 */
faqController.prototype.add = async (updateValue) => {
    if (Array.isArray(updateValue)) { //updateValue instanceof Array
        return await Faq.insertMany(updateValue)
            .then(result => {
                console.log("***Faq many save success result", result);
                return result;
            })
            .catch(err => {
                console.error("!!!Faq many save failed: ", err);
                throw err;
            })
    } else {
        return await Faq.create(updateValue)
            .then(result => {
                console.log("***Faq save success result._id", result);
                return result;
            })
            .catch(err => {
                console.error("!!!Faq save failed: ", err);
                throw err;
            })
    }
};


/**
 * get Faq
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Faq
 */
faqController.prototype.getPanel = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //updateValue instanceof Array
        return await Faq.panelList()
            .then(faqs => faqs)
            .catch(err => {
                console.error("!!!Faq getAll failed: ", err);
                throw err;
            })
    } else {
        return await Faq.getById(optFilter)
            .catch(err => {
                console.error("!!!Faq get failed: ", err);
                throw err;
            })
    }
};


/**
 * get Faq
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Faq
 */
faqController.prototype.getApp = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //updateValue instanceof Array
        return await Faq.appList(optFilter)
            .then(faqs => faqs)
            .catch(err => {
                console.error("!!!Faq getAll failed: ", err);
                throw err;
            })
    } else {
        return await Faq.get(optFilter)
            .catch(err => {
                console.error("!!!Faq get failed: ", err);
                throw err;
            })
    }
};

/**
 * Remove Faq
 *
 * @param {String} id
 * @returns {Promise}
 *
 */
faqController.prototype.remove = async (id) => {
    let newStatus = 2;
    return await Faq.setStatus(id,2,oldStatus=>oldStatus!==newStatus)
        .then(result => {
            console.log(`***Faq Removed by id ${id} result: `, result);
            return result;
        })
        .catch(err => {
            console.log(`!!!Faq Remove failed for id ${id}: `, err);
            throw err;
        });
};

/**
 * Update Faq
 *
 * @param {Object} updateValue
 *
 * @return Query
 */
faqController.prototype.update = async (updateValue) => {

    return await Faq.findByIdAndUpdate(updateValue.faqId, updateValue)
        .then(result => {
            console.log(`***Faq Update by id ${updateValue.id} result: `, result);
            return result;
        })
        .catch(err => {
            console.error("!!!Faq Update failed: ", err);
            throw err;
        });

};

module.exports = new faqController();
