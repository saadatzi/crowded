/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Event = require('../models/Event');
const {googleStaticImage} = require('../utils/map');
const moment = require('moment-timezone');

const eventController = function () {
};

/**
 * Add new Event
 *
 * @param {Object || Array} newEvent
 *
 * @return {ObjectId} eventId
 */
eventController.prototype.add = async (newEvent) => {
    if (Array.isArray(newEvent)) { //newEvent instanceof Array
        return await Event.insertMany(newEvent)
            .then(result => {
                return result;
            })
            .catch(err => {
                console.error("!!!Event many save failed: ", err);
                throw err;
            })
    } else {
        return await Event.create(newEvent)
            .then(event => {
                return event;
            })
            .catch(err => {
                console.error("!!!Event save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Event
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Event
 */
eventController.prototype.get = async (optFilter, type = 'id') => {
    if (!optFilter || optFilter instanceof Object) { //newEvent instanceof Array
        return await Event.getAllMyInterestEvent(optFilter)
            .then(events => events)
            .catch(err => {
                console.error("!!!Event getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'id') {
            return await Event.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!Event get failed: ", err);
                    throw err;
                })
        } else if (type === 'validApplyEvent') {
            return await Event.validApplyEvent(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!validEvent get failed: ", err);
                    throw err;
                })
        } else if (type === 'validActiveEvent') {
            return await Event.validActiveEvent(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!validActiveEvent get failed: ", err);
                    throw err;
                })
        }

    }
};

/**
 * get List Event (OWN,GROUP,ANY)
 *
 * @param {ObjectId} userId
 * @param {Object} optFilter
 * @param {String} accessLevel
 *
 * @return Events
 */
eventController.prototype.list = async (userId, optFilter, accessLevel) => {
    if (accessLevel === 'GROUP') {
        return await Event.listGroup(userId, optFilter)
            .catch(err => {
                console.error("!!!Event getAll failed: ", err);
                throw err;
            })
    } else {
        console.log(">>>>>>>>>>>>>>>> accessLevel: %s", accessLevel);
        return await Event.listOwnAny(userId, optFilter, accessLevel)
            .catch(err => {
                console.error("!!!Event getAll failed: ", err);
                throw err;
            })
    }
};

/**
 * getById Event
 *
 * @param {ObjectId} id
 * @param {String} lang
 * @param {ObjectId} userId
 *
 * @return Event
 */
eventController.prototype.getByIdAggregate = async (id, lang, userId = null) => {
    let userEventStatus = null;
    if (userId) {
        await userEventController.getByUserEvent(userId, id)
            .then(userEvent => {
                if (userEvent) userEventStatus = userEvent.status;
            })
            .catch(err => {
                console.error("!!!Event getByUserEvent failed: ", err);
                throw err;
            })
    }
    const isApproved = ['APPROVED', 'ACTIVE', 'LEFT', 'PAUSED', 'SUCCESS'].includes(userEventStatus);
    return await Event.getByIdAggregate(id, lang, isApproved, userEventStatus)
        .then(async event => {
            if (isApproved) event = Object.assign(event, {map: isApproved ? {url: await googleStaticImage(event.coordinates[0], event.coordinates[1])} : null});
            return event
        })
        .catch(err => {
            console.error("!!!Event get failed: ", err);
            throw err;
        })

};

/**
 * Get Event Detail for panel
 *
 * @param {String} optFilter (id)
 *
 * @return Event
 */
eventController.prototype.getOnePanel = async (optFilter) => {
    return await Event.getOnePanel(optFilter)
        .then(result => result)
        .catch(err => {
            console.error("!!!Event get failed: ", err);
            throw err;
        });
};


/**
 * get myEvent
 *
 * @param {ObjectId} userId
 * @param {String} lang
 * @param {Number} page
 * @param {Boolean | Number} isPrevious
 * @param {Date} date
 *
 * @return Event
 */
eventController.prototype.getMyEvent = async (userId, lang, page = 0, isPrevious = false, date = null) => {
    const showPrevEvent = isPrevious == 'true' || isPrevious == 1;
    if (String(date).length > 10) {
        date = date / 1000;
    }
    const dateFilter = date ? {
        startMonth: moment.unix(date).startOf('month').toDate(),
        endMonth: moment.unix(date).endOf('month').toDate()
    } : null;

    return await Event.getAllMyEvent(userId, lang, page, showPrevEvent, dateFilter)
        .then(async event => event)
        .catch(err => {
            console.error("!!!Event getMyEvent failed: ", err);
            throw err;
        })

};

/**
 * remove Event
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
eventController.prototype.remove = async (id) => {
    let newStatus = 2;
    return await Event.setStatus(id, 2, oldStatus => oldStatus !== newStatus)
        .then(result => {
            console.log(`***Event Remove by id ${id} result: `, result);
            return result;
        })
        .catch(err => {
            console.error("!!!Event Remove failed: ", err);
            throw err;
        });

};

/**
 * remove Event
 *
 * @param {ObjectId} eventId
 * @param {ObjectId} imageId
 *
 * @return Query
 */
eventController.prototype.removeImage = async (eventId, imageId) => {
    return await Event.findByIdAndUpdate(eventId, {$pull: {images: {_id: mongoose.Types.ObjectId(imageId)}}})
        .then(result => {
            console.log(`***Event Remove Image result: `, result);
            return result;
        })
        .catch(err => {
            console.error("!!!Event Remove Image failed: ", err);
            throw err;
        });

};

/**
 * Update Event
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
eventController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Event.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Event  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Event Update failed: ", err);
                    throw err;
                })
        } else {

            return await Event.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Event Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!Event Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new eventController();
const userEventController = require('./userEvent');
