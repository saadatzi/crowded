/**
 * Module dependencies.
 */

const UserEvent = require('../models/UserEvent');
const eventController = require('./event');
const transactionController = require('./transaction');
const moment = require('moment-timezone');

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
    return await eventController.get(eventId, 'validApplyEvent')
        .then(async event => {
            if (event) {
                return await UserEvent.create(applyUserEvent)
                    // .then(event => event)
                    .catch(err => {
                        console.error("!!!UserEvent save failed: ", err);
                        if (err.code === 11000) throw {
                            message: "You have already registered for this event",
                            code: 424
                        };
                        throw err;
                    })
            }
            throw {code: 400, message: 'Event not valid! or Expired allow apply time!'};
        })
        .catch(err => {
            console.error("!!!Get validEvent failed: ", err);
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
    //TODO if multi in current?!
    return await UserEvent.getOne({userId, status: {$in: ['ACTIVE', 'PAUSED', 'CONTINUE']}})
        .then(async result => {
            if (result) {
                //get from Event Aggregate
                return await eventController.getByIdAggregate(result.eventId, lang, userId)
                    .then(result => result)
                    .catch(err => {
                        console.error("!!!UserEvent current then getByIdAggregate failed: ", err);
                        throw err;
                    })
            } else {
                return null;
            }

        })
        .catch(err => {
            console.error("!!!UserEvent current failed: ", err);
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
            console.error("!!!UserEvent getByUserEvent failed: ", err);
            throw err;
        })
};

/**
 * get UserEvent & valid status for Report
 *
 * @param {ObjectId} userId
 * @param {ObjectId} eventId
 * @param {Array} validStatus
 * @return UserEvent
 */
userEventController.prototype.isValidUserEventReport = async (userId, eventId, validStatus) => {
    return await UserEvent.getOne({userId, eventId, status: {$in: validStatus}})
        .then(result => !!result)
        .catch(err => {
            console.error("!!!UserEvent getByUserEvent failed: ", err);
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
    let updateValue = {status};
    if (newValue) Object.assign(updateValue, newValue);
    if (status === 'ACTIVE' || status === 'PAUSED' || status === 'CONTINUE') {
        await UserEvent.getOne({userId, eventId})
            .then(async userEvent => {
                if (!userEvent) throw {code: 404, message: 'Not found!'}
                if (status === 'ACTIVE' && userEvent.status !== 'APPROVED') throw {
                    code: 406,
                    message: 'Active status mismatch!'
                };
                if (status === 'PAUSED' && (userEvent.status !== 'ACTIVE' && userEvent.status !== 'CONTINUE')) throw {
                    code: 406,
                    message: 'Paused status mismatch!'
                };
                if (status === 'CONTINUE' && userEvent.status !== 'PAUSED') throw {
                    code: 406,
                    message: 'Active again status mismatch!'
                }
            })
            .catch(err => {
                console.error("!!!UserEvent getOne check Approved failed: ", err);
                throw err;
            })
    }
    // must be event from =< current && current < to
    if (status === 'ACTIVE' || status === 'CONTINUE') {
        await eventController.get(eventId, 'validActiveEvent')
            .then(event => {
                if (!event) throw {code: 400, message: 'The event has not started or ended!'};
            })
            .catch(err => {
                console.error("!!!validActiveEvent failed: ", err);
                throw err;
            })
    }
    return await UserEvent.findOneAndUpdate({userId, eventId}, updateValue)
        .then(async result => {
            if (!result) throw {code: 404, message: 'Not found!'}
            return result
        })
        .catch(err => {
            console.error("!!!UserEvent getByUserEvent failed: ", err);
            throw err;
        })
};


/**
 * manage Participants
 *
 * @param {Admin} admin
 * @param {Object} reqInfo
 * @param {Object} auth
 *
 * @return Users
 */
userEventController.prototype.manageParticipant = async (admin, reqInfo, auth) => {
    const mpLevel = auth.accessLevel.PARTICIPANTS[1].U.level;
    return await eventController.get(reqInfo.eventId)
        .then(async event => {
            if (!event) throw {code: 404, message: 'Event not found!'}
            if (mpLevel === 'GROUP' && (event.orgId).toString() !== (admin.organizationId).toString())
                throw new {code: 403, message: 'You are not authorized to manage participants for this event!'};
            if (mpLevel === 'OWN' && (event.owner).toString() !== (admin._id).toString())
                throw {code: 403, message: 'You are not authorized to manage participants for this event!'}

            return await UserEvent.getOne({userId: reqInfo.userId, eventId: reqInfo.eventId})
                .then(async userEvent => {
                    if (!userEvent) throw {code: 404, message: 'Not found!'};
                    if (reqInfo.isApproved && (userEvent.status !== 'APPLIED' && userEvent.status !== 'REJECTED')) throw {
                        code: 406,
                        message: 'request Approved has status mismatch!'
                    };
                    if (!reqInfo.isApproved && userEvent.status !== 'APPLIED') throw {
                        code: 406,
                        message: 'request Rejected has status mismatch!'
                    };
                    userEvent.status = reqInfo.isApproved ? 'APPROVED' : 'REJECTED';
                    userEvent.save();
                    return event;
                })
                .catch(err => {
                    console.error("!!!UserEvent getOne check Approved failed: ", err);
                    throw err;
                })
        })
        .catch(err => {
            console.error("!!!User manageParticipant eventController failed: ", err);
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
                                                console.error("!!!UserEvent transactionController Add failed: ", err);
                                                throw err;
                                            })
                                    })
                                    .catch(err => {
                                        console.error("!!!UserEvent setStatus SUCCESS failed: ", err);
                                        throw err;
                                    })
                            } else {
                                throw {code: 406, message: 'Elapsed time mismatch!'}
                            }
                        })
                        .catch(err => {
                            console.error("!!!UserEvent get elapsed Event failed: ", err);
                            throw err;
                        })
                } else {
                    return true
                }
            } else {
                throw {code: userEvent ? 406 : 404, message: userEvent ? 'Status mismatch!' : 'not found!'}
            }

        })
        .catch(err => {
            console.error("!!!UserEvent getByUserEvent elapsed failed: ", err);
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
                    console.error("!!!UserEvent Remove failed: ", err);
                    throw err;
                })
        } else {

            return await UserEvent.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***UserEvent Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!UserEvent Remove failed: ", err);
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
                    console.error("!!!UserEvent Update failed: ", err);
                    throw err;
                })
        } else {
            return await UserEvent.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***UserEvent Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!UserEvent Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};


/**
 * fix final status
 *
 */
userEventController.prototype.finalStatus = async () => {
    return await UserEvent.jobFinalStatus()
        .catch(err => {
            // console.error("!!!UserEvent FinalStatus failed: ", err);
            throw err;
        })

};

/**
 * send Notification for tomorrow event
 */
userEventController.prototype.tomorrowEvent = async () => {
    const startDay = moment().add(1, "d").startOf('day').toDate(),
        endDay = moment().add(1, "d").endOf('day').toDate();
    return await UserEvent.jobTomorrowEvent(startDay, endDay)
        .catch(err => {
            // console.error("!!!UserEvent FinalStatus failed: ", err);
            throw err;
        })

};

/**
 * send Notification for 1 hour next event
 */
userEventController.prototype.nextHourEvent = async () => {
    return await UserEvent.jobNextHourEvent()
        .then(result => {
            //Update informed notification Event
            const eventIds = [];
            result.map(hr => {eventIds.push(hr.eventId)});
            eventController.update({_id: {$in: eventIds}}, {informed: true})
                .catch(err => console.error("eventController updateMany informed notification Catch", err));
            return result;
        })
        .catch(err => {
            // console.error("!!!UserEvent FinalStatus failed: ", err);
            throw err;
        })

};

const newUserEventController = new userEventController();
module.exports = newUserEventController;
