/**
 * Module dependencies.
 */
const UserEvent = require('../models/UserEvent');
const deviceController = require('../controllers/device');
const userController = require('../controllers/user');


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
        ApplyTime: new Date(),
    };
    return await UserEvent.create(applyUserEvent)
        .then(event => {
            console.log("***UserEvent save success event", event);
            return event;
        })
        .catch(err => {
            console.log("!!!UserEvent save field: ", err);
            throw err;
        })
};

/**
 * get UserEvent
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return UserEvent
 */
userEventController.prototype.get = async (optFilter, type = 'id') => {
    if (!optFilter || optFilter instanceof Object) { //newUserEvent instanceof Array
        return await UserEvent.getAllMyUserEvents(optFilter)
            .then(events => events)
            .catch(err => {
                console.error("!!!UserEvent getAll field: ", err);
                throw err;
            })
    } else {
        return await UserEvent.getById(optFilter)
            .then(result => {
                return result.detailDto(optFilter.lang)
            })
            .catch(err => {
                console.log("!!!UserEvent get field: ", err);
                throw err;
            })
    }
};

/**
 * getById UserEvent
 *
 * @param {ObjectId} id
 * @param {String} optFilter
 *
 * @return UserEvent
 */
userEventController.prototype.getById = async (id, lang) => {
    return await UserEvent.getByIdAggregate({id, lang})
        .then(event => event)
        .catch(err => {
            console.error("!!!UserEvent get field: ", err);
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
                    console.log("!!!UserEvent Remove field: ", err);
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
                    console.log("!!!UserEvent Remove field: ", err);
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
            //ToDo return Query?!
            return await UserEvent.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***UserEvent  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!UserEvent Update field: ", err);
                    throw err;
                })
        } else {
            //ToDo return Query?!
            return await UserEvent.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***UserEvent Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!UserEvent Update field: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new userEventController();
