/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
let Interest = require('../models/Interest');


const UserController = function () {
};

/**
 * Add new User
 *
 * @param {Object || Array} newInterest
 *
 * @return {ObjectId} interestId
 */
UserController.prototype.add = async (newInterest) => {
    if (Array.isArray(newInterest)) { //newInterest instanceof Array
        return await Interest.insertMany(newInterest)
            .then(room => {
                console.log("***Interest many save success room", room);
                return room;
            })
            .catch(err => {
                console.log("!!!Interest many save field: ", err);
                return -1;
            })
    } else {
        return await Interest.create(newInterest)
            .then(room => {
                console.log("***Interest save success room._id", room._id);
                return room._id;
            })
            .catch(err => {
                console.log("!!!Interest save field: ", err);
                return -1;
            })
    }
};

/**
 * get User
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Interest
 */
UserController.prototype.get = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //newInterest instanceof Array
        return await Interest.getAll(optFilter)
            .then(result => {
                console.log("***Interest get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Interest getAll field: ", err);
                return -1;
            })
    } else {
        return await Interest.get(optFilter)
            .then(result => {
                console.log(`***Interest get by id ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.log("!!!Interest get field: ", err);
                return -1;
            })
    }
};

/**
 * remove User
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
UserController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            //ToDo return Query?!
            return await Interest.remove(optFilter)
                .then(result => {
                    console.log("***Interest  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Interest Remove field: ", err);
                    return -1;
                })
        } else {
            //ToDo return Query?!
            return await Interest.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Interest Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Interest Remove field: ", err);
                    return -1;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update User
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
UserController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            //ToDo return Query?!
            return await Interest.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Interest  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Interest Update field: ", err);
                    return -1;
                })
        } else {
            //ToDo return Query?!
            return await Interest.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Interest Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Interest Update field: ", err);
                    return -1;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new UserController();
