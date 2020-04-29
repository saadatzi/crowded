/**
 * Module dependencies.
 */
let User = require('../models/User');
const settings = require('../utils/settings')
const userController = function () {
};

/**
 * Add new User
 *
 * @param {Object || Array} newUser
 *
 * @return {ObjectId} interestId
 */
userController.prototype.add = async (newUser) => {
    if (Array.isArray(newUser)) { //newUser instanceof Array
        return await User.insertMany(newUser)
            .then(result => {
                console.log("***User many save success result", result);
                return result;
            })
            .catch(err => {
                console.log("!!!User many save failed: ", err);
                throw err;
            })
    } else {
        return await User.create(newUser)
            .then(user => {
                console.log("*** User save success user", user);
                return user;
            })
            .catch(err => {
                console.log("!!!User save failed: ", err);
                throw err;
            })
    }
};

/**
 * get User
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return User
 */
userController.prototype.get = async (optFilter, type = 'email') => {
    if (!optFilter || optFilter instanceof Object) { //newUser instanceof Array
        return await User.getAll(optFilter)
            .then(result => {
                console.log("***User get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!User getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await User.getByEmail(optFilter)
                .then(result => {

                    return result})
                .catch(err => {
                    console.log("!!!User getByEmail failed: ", err);
                    throw err;
                })
        } else {
            return await User.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.log("!!!User getById failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * remove User
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
userController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await User.remove(optFilter)
                .then(result => {
                    console.log("***User  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Remove failed: ", err);
                    throw err;
                })
        } else {

            return await User.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***User Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Remove failed: ", err);
                    throw err;
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
userController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await User.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***User  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Update failed: ", err);
                    throw err;
                })
        } else {
            return await User.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***User Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!User Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

/**
 * DTO User
 *
 * @param {User} user
 *
 * @return clean user
 */
const dto = user => {
    return {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        sex: user.sex,
        birthDate: user.birthDate,
        nationality: user.nationality,
        image: user.image ? {url:`${settings.cdn_domain}${user.image}`} : null,
    }
};
userController.prototype.dto = dto;

module.exports = new userController();
