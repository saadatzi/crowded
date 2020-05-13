/**
 * Module dependencies.
 */
let User = require('../models/User');
const settings = require('../utils/settings');
const eventController = require('./event');

const BankAccount = require('../models/BankAccount');

const userController = function () {
};



/**
 * Get a list of users
 *
 * @param {Object} optFilter
 *
 * @return {Object} {items + explain}
 */
userController.prototype.getManyPanel = async (optFilter) => {
    return await User.getManyPanel(optFilter)
        .then(result => {
            console.log("***User getManyPanel success result", result);
            return result;
        })
        .catch(err => {
            console.error("!!!User getManyPanel failed: ", err);
            throw err;
        })
};


/**
 * Get a user
 *
 * @param {Object} optFilter
 *
 * @return {Object} {user}
 */
userController.prototype.getOnePanel = async (optFilter) => {
    return await User.getOnePanel(optFilter)
        .then(result => {
            console.log("***User getOnePanel success result", result);
            return result;
        })
        .catch(err => {
            console.error("!!!User getOnePanel failed: ", err);
            throw err;
        })
};



/**
 * getBankAccountsList
 *
 * @param {Object} optFilter
 *
 * @return {Object} {user}
 */
userController.prototype.getBankAccountsList = async (userId, optFilter) => {
    return await BankAccount.getManyForUser(userId, optFilter)
        .then(result => {
            console.log("***User getBankAccountsList success result", result);
            return result;
        })
        .catch(err => {
            console.error("!!!User getBankAccountsList failed: ", err);
            throw err;
        })
};

/**
 * getBankAccountsList
 *
 * @param {String} id
 *
 * @return {Object} {user}
 */
userController.prototype.getBankAccountDetail = async (id) => {
    return await BankAccount.getOnePanel(id)
        .then(result => {
            console.log("***User getBankAccountDetail success result", result);
            return result;
        })
        .catch(err => {
            console.error("!!!User getBankAccounDetail failed: ", err);
            throw err;
        })
};

/**
 * deleteBankAccount
 *
 * @param {String} id
 *
 * @return {Object} {user}
 */
userController.prototype.deleteBankAccount = async (id) => {
    return await BankAccount.changeStatus(id,2)
        .then(result => {
            console.log("***User deleteBankAccount success result", result);
            return result;
        })
        .catch(err => {
            console.error("!!!User deleteBankAccount failed: ", err);
            throw err;
        })
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
                console.error("!!!User many save failed: ", err);
                throw err;
            })
    } else {
        return await User.create(newUser)
            .then(user => {
                console.log("*** User save success user", user);
                return user;
            })
            .catch(err => {
                console.error("!!!User save failed: ", err);
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
                console.error("!!!User getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await User.getByEmail(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!User getByEmail failed: ", err);
                    throw err;
                })
        } else if (type === 'interest') {
            return await User.getByIdInterest(optFilter)
                .then(result => {
                    console.log(">>>>>>>>>>>>>>>>>> getByIdInterest result: ", result);
                    return result
                })
                .catch(err => {
                    console.error("!!!User getByEmail failed: ", err);
                    throw err;
                })
        } else {
            return await User.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.error("!!!User getById failed: ", err);
                    throw err;
                })
        }
    }
};


/**
 * get Participants
 *
 * @param {Object} optFilter
 * @param {Admin} admin
 * @param {Object} auth
 *
 * @return Users
 */
userController.prototype.getParticipants = async (admin, optFilter, auth) => {
    if (auth.accessLevel.EVENT[0].R.level === 'OWN' || auth.accessLevel.EVENT[0].R.level === 'GROUP') {
        await eventController.get(optFilter.eventId)
            .then(async event => {
                if (!event) throw {code: 404, message: 'Event not found!'}
                if (auth.accessLevel.EVENT[0].R.level === 'OWN' && (event.owner).toString() !== (admin._id.toString()))
                    throw {code: 403, message: 'You are not authorized to receive about this event!'}
                if (auth.accessLevel.EVENT[0].R.level === 'GROUP' && (event.orgId).toString() !== (admin.organizationId).toString())
                    throw new {code: 403, message: 'You are not authorized to receive about this event!'}
            })
            .catch(err => {
                console.error("!!!User getParticipants eventController failed: ", err);
                throw err;
            })
    }
    return await User.getAllInEvent(optFilter)
        .then(result => result)
        .catch(err => {
            console.error("!!!User getAllInEvent failed: ", err);
            throw err;
        })

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
                    console.error("!!!User Remove failed: ", err);
                    throw err;
                })
        } else {

            return await User.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***User Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.error("!!!User Remove failed: ", err);
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
                    console.error("!!!User Update failed: ", err);
                    throw err;
                })
        } else {
            return await User.findByIdAndUpdate(optFilter, newValue)
                .then(result => result)
                .catch(err => {
                    console.error("!!!User Update failed: ", err);
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
        image: user.image ? {url: `${settings.cdn_domain}${user.image}`} : null,
    }
};
userController.prototype.dto = dto;

module.exports = new userController();
