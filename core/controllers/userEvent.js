/**
 * Module dependencies.
 */

const UserEvent = require('../models/UserEvent');
const eventController = require('./event');


const userEventController = function () {
};

/**
 * Add new UserEvent
 *
 * @param {ObjectId} eventId
 * @param {ObjectId} userId
 *
 */
userEventController.prototype.add = async (eventId, userId) => {
    const applyUserEvent = {
        userId: userId,
        eventId: eventId,
        status: 'APPLIED',
    };
    //ToDo if other Applied in same time //now skipped
    return await UserEvent.create(applyUserEvent)
        .then(event => {
            console.log("***UserEvent save success event", event);
            return event;
        })
        .catch(err => {
            console.log("!!!UserEvent save failed: ", err);
            throw err;
        })
};

/**
 * get current UserEvent
 *
 * @param {ObjectId} userId
 * @param {String} lang
 *
 * @return UserEvent
 */
userEventController.prototype.getCurrent = async (userId, lang) => {
    return await UserEvent.getOne({userId, status: {$in: ['ACTIVE', 'PAUSED']}})
        .then(async result => {
            if (result) {
                //get from Event Aggregate
                return await eventController.getByIdAggregate(result.eventId, lang, userId)
                    .then(result => result)
                    .catch(err => {
                        console.log("!!!UserEvent current then getByIdAggregate failed: ", err);
                        throw err;
                    })
            } else {
                return  null;
            }

        })
        .catch(err => {
            console.log("!!!UserEvent current failed: ", err);
            throw err;
        })
};

/**
 * get UserEvent
 *
 * @param {ObjectId} userId
 * @param {ObjectId} eventId
 * @return UserEvent
 */
userEventController.prototype.getByUserEvent = async (userId, eventId) => {
    return await UserEvent.getOne({userId, eventId})
        .then(async result => result)
        .catch(err => {
            console.log("!!!UserEvent getByUserEvent failed: ", err);
            throw err;
        })
};

/**
 * set Status UserEvent
 *
 * @param {ObjectId} userId
 * @param {ObjectId} eventId
 * @param {String} status
 * @param {Object} newValue
 * @return UserEvent
 */
userEventController.prototype.setStatus = async (userId, eventId, status, newValue = null) => {
    let updateValue = {status, updateAt: new Date()};
    if (newValue) Object.assign(updateValue, newValue)
    console.log(">>>>>>>>>> updateValue: ", updateValue);
    return await UserEvent.findOneAndUpdate({userId, eventId}, updateValue)
        .then(async result => result)
        .catch(err => {
            console.log("!!!UserEvent getByUserEvent failed: ", err);
            throw err;
        })
};

/**
 * add Attendance elapsed UserEvent
 *
 * @param {ObjectId} userId
 * @param {ObjectId} eventId
 * @param {Object} newValue
 * @return UserEvent
 */
userEventController.prototype.addElapsed = async (userId, eventId, newValue) => {
    let newAttendanceElapsed = {
        elapsed: newValue.elapsed,
        location: {coordinates: newValue.coordinates}
    };
    return await UserEvent.getOne({userId, eventId})
        .then(async userEvent => {
            userEvent.attendance.push(newAttendanceElapsed);
            userEvent.save();
            return true
        })
        .catch(err => {
            console.log("!!!UserEvent getByUserEvent failed: ", err);
            throw err;
        })
};

/**
 * getById UserEvent
 *
 * @param {ObjectId} id
 *
 * @return UserEvent
 */
userEventController.prototype.getById = async (id) => {
    return await UserEvent.getById({id, lang})
        .then(event => event)
        .catch(err => {
            console.error("!!!UserEvent get failed: ", err);
            throw err;
        })

};

/**
 * remove UserEvent
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
userEventController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            //ToDo return Query?!
            return await UserEvent.remove(optFilter)
                .then(result => {
                    console.log("***UserEvent  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!UserEvent Remove failed: ", err);
                    throw err;
                })
        } else {
            //ToDo return Query?!
            return await UserEvent.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***UserEvent Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!UserEvent Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update UserEvent
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
userEventController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await UserEvent.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***UserEvent  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!UserEvent Update failed: ", err);
                    throw err;
                })
        } else {
            return await UserEvent.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***UserEvent Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!UserEvent Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new userEventController();
