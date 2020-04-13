/**
 * Module dependencies.
 */
const Event = require('../models/Event');
const {googleStaticImage} = require('../utils/map');


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
            .then(room => {
                console.log("***Event many save success room", room);
                return room;
            })
            .catch(err => {
                console.log("!!!Event many save failed: ", err);
                throw err;
            })
    } else {
        return await Event.create(newEvent)
            .then(event => {
                console.log("***Event save success event", event);
                return event;
            })
            .catch(err => {
                console.log("!!!Event save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Event
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Event
 */
eventController.prototype.get = async (optFilter, type = 'id') => {
    if (!optFilter || optFilter instanceof Object) { //newEvent instanceof Array
        return await Event.getAllMyEvents(optFilter)
            .then(events => events)
            .catch(err => {
                console.error("!!!Event getAll failed: ", err);
                throw err;
            })
    } else {
        return await Event.getById(optFilter)
            .then(result => {
                return result.detailDto(optFilter.lang)
            })
            .catch(err => {
                console.log("!!!Event get failed: ", err);
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
 * remove Event
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
eventController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            //ToDo return Query?!
            return await Event.remove(optFilter)
                .then(result => {
                    console.log("***Event  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Event Remove failed: ", err);
                    throw err;
                })
        } else {
            //ToDo return Query?!
            return await Event.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Event Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Event Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


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
            //ToDo return Query?!
            return await Event.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Event  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Event Update failed: ", err);
                    throw err;
                })
        } else {
            //ToDo return Query?!
            return await Event.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Event Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Event Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new eventController();
const userEventController = require('./userEvent');
