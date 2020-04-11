/**
 * Module dependencies.
 */
const Event = require('../models/Event');
const deviceController = require('../controllers/device');
const userController = require('../controllers/user');


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
                console.log("!!!Event many save field: ", err);
                throw err;
            })
    } else {
        return await Event.create(newEvent)
            .then(event => {
                console.log("***Event save success event", event);
                return event;
            })
            .catch(err => {
                console.log("!!!Event save field: ", err);
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
eventController.prototype.get = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //newEvent instanceof Array
        return await Event.getAllMyEvents(optFilter)
            .then(events => {
                // let returnedEvents = [];
                // events.map(event => returnedEvents.push(event.transform(optFilter.selected, optFilter.lang)));
                // return returnedEvents;
                return events;
            })
            .catch(err => {
                console.log("!!!Event getAll field: ", err);
                throw err;
            })
    } else {
        return await Event.getById(optFilter)
            .then(result => {
                console.log(`***Event get by id ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.log("!!!Event get field: ", err);
                throw err;
            })
    }
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
                    console.log("!!!Event Remove field: ", err);
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
                    console.log("!!!Event Remove field: ", err);
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
                    console.log("!!!Event Update field: ", err);
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
                    console.log("!!!Event Update field: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new eventController();
