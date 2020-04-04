/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
let User = require('../models/User');


const UserController = function () {
};

/**
 * Add new User
 *
 * @param {Object || Array} newUser
 *
 * @return {ObjectId} interestId
 */
UserController.prototype.add = async (newUser) => {
    if (Array.isArray(newUser)) { //newUser instanceof Array
        return await User.insertMany(newUser)
            .then(room => {
                console.log("***User many save success room", room);
                return room;
            })
            .catch(err => {
                console.log("!!!User many save field: ", err);
                return -1;
            })
    } else {
        return await User.create(newUser)
            .then(room => {
                console.log("***User save success room._id", room);
                return room;
            })
            .catch(err => {
                console.log("!!!User save field: ", err);
                return -1;
            })
    }
};

/**
 * get User
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return User
 */
UserController.prototype.get = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //newUser instanceof Array
        return await User.getAll(optFilter)
            .then(result => {
                console.log("***User get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!User getAll field: ", err);
                return -1;
            })
    } else {
        return await User.get(optFilter)
            .then(result => {
                console.log(`***User get by id ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.log("!!!User get field: ", err);
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
            return await User.remove(optFilter)
                .then(result => {
                    console.log("***User  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Remove field: ", err);
                    return -1;
                })
        } else {
            //ToDo return Query?!
            return await User.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***User Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Remove field: ", err);
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
            return await User.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***User  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Update field: ", err);
                    return -1;
                })
        } else {
            //ToDo return Query?!
            return await User.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***User Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Update field: ", err);
                    return -1;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new UserController();
