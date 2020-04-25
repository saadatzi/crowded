/**
 * Module dependencies.
 */

const UserEvent = require('../models/UserEvent');
const eventController = require('./event');
const transactionController = require('./transaction');


const userEventController = function () {
};

/**
 * Add new UserEvent => Apply
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
    //TODO if other Applied in same time //now skipped
    return await UserEvent.create(applyUserEvent)
        .then(event => {
            console.log("***UserEvent save success event", event);
            return event;
        })
        .catch(err => {
            console.log("!!!UserEvent save failed: ", err);
            if (err.code === 11000) throw {message: "You have already registered for this event", code: 424};
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
                return null;
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
    if (status === 'ACTIVE' || status === 'PAUSED' || status === 'CONTINUE') {
        await UserEvent.getOne({userId, eventId})
            .then(async userEvent => {
                if (!userEvent) throw {code: 404, message: 'Not found!'}//Continue
                if (status === 'ACTIVE'  && userEvent.status !== 'APPROVED') throw {code: 406, message: 'Status mismatch!'};
                if (status === 'PAUSED'  && (userEvent.status !== 'ACTIVE' || userEvent.status !== 'CONTINUE')) throw {code: 406, message: 'Status mismatch!'};
                if (status === 'CONTINUE'  && userEvent.status !== 'PAUSED') throw {code: 406, message: 'Status mismatch!'}
            })
            .catch(err => {
                console.log("!!!UserEvent getOne check Approved failed: ", err);
                throw err;
            })
    }
    return await UserEvent.findOneAndUpdate({userId, eventId}, updateValue)
        .then(async result => {
            if (!result) throw {code: 404, message: 'Not found!'}
            return result
        })
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
 * @param {Number} elapsed,
 * @param {Array} coordinates,
 * @param {Boolean} isFinished,
 * @return UserEvent
 */
userEventController.prototype.addElapsed = async (userId, eventId, elapsed, coordinates, isFinished = false) => {
    console.log(">>>>>>>>>>>>>>>> addElapsed: elapsed: %s -- coordinates: %s -- isFinished: %s", elapsed, coordinates, isFinished);
    let newAttendanceElapsed = {
        elapsed: elapsed,
        location: {coordinates: coordinates}
    };
    return await UserEvent.getOne({userId, eventId})
        .then(async userEvent => {
            if (userEvent && (userEvent.status === 'ACTIVE' || userEvent.status === 'CONTINUE')) {
                userEvent.attendance.push(newAttendanceElapsed);
                userEvent.save();
                if (isFinished) {
                    return eventController.get(eventId)
                        .then(async event => {
                            if (elapsed >= event.attendance) {
                                return newUserEventController.setStatus(userId, eventId, 'SUCCESS')
                                    .then(result => {
                                        transactionController.add(userId, eventId)
                                            .then(result => {
                                                return true
                                            })
                                            .catch(err => {
                                                console.log("!!!UserEvent transactionController Add failed: ", err);
                                                throw err;
                                            })
                                    })
                                    .catch(err => {
                                        console.log("!!!UserEvent setStatus SUCCESS failed: ", err);
                                        throw err;
                                    })
                            } else {
                                throw {code: 406, message: 'Elapsed time mismatch!'}
                            }
                        })
                        .catch(err => {
                            console.log("!!!UserEvent get Event failed: ", err);
                            throw err;
                        })
                } else {
                    return true
                }
            } else {
                throw {code: 406, message: userEvent ? 'Status mismatch!' : 'not found!'}
            }

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
const newUserEventController = new userEventController();
module.exports = newUserEventController;
