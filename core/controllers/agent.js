/**
 * Module dependencies.
 */

let Agent = require('../models/Agent');

const agentController = function () {
};

/**
 * Login User Panel
 *
 * @param {String} email
 * @param {String} pass
 *
 * @return {Agent} agent
 */
agentController.prototype.auth = async (email, pass) => {

    return await Agent.getAuthenticated(email, pass)
        .then(agent => {
            console.log("***Login Agent success agent", agent);
            return agent;
        })
        .catch(err => {
            console.log("!!!Login Agent failed: ", err);
            throw err;
        })
};


/**
 * Add new Agent
 *
 * @param {Object || Array} newAgent
 *
 * @return {ObjectId} interestId
 */
agentController.prototype.add = async (newAgent) => {
    if (Array.isArray(newAgent)) { //newAgent instanceof Array
        return await Agent.insertMany(newAgent)
            .then(room => {
                console.log("***Agent many save success room", room);
                return room;
            })
            .catch(err => {
                console.log("!!!Agent many save failed: ", err);
                throw err;
            })
    } else {
        return await Agent.create(newAgent)
            .then(agent => {
                console.log("*** Agent save success agent", agent);
                return agent;
            })
            .catch(err => {
                console.log("!!!Agent save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Agent
 *
 * @param {Object || ObjectId} optFilter
 * @param {String} type
 *
 * @return Agent
 */
agentController.prototype.get = async (optFilter, type = 'email') => {
    console.log("***Agent get by Id optFilter 2: ", optFilter);
    if (!optFilter || optFilter instanceof Object) { //newAgent instanceof Array
        return await Agent.getAll(optFilter)
            .then(result => {
                console.log("***Agent get All result: ", result);
                return result;
            })
            .catch(err => {
                console.log("!!!Agent getAll failed: ", err);
                throw err;
            })
    } else {
        if (type === 'email') {
            return await Agent.getByEmail(optFilter)
                .then(result => result)
                .catch(err => {
                    console.log("!!!Agent getByEmail failed: ", err);
                    throw err;
                })
        } else {
            return await Agent.getById(optFilter)
                .then(result => result)
                .catch(err => {
                    console.log("!!!Agent get failed: ", err);
                    throw err;
                })
        }
    }
};

/**
 * remove Agent
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
agentController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Agent.remove(optFilter)
                .then(result => {
                    console.log("***Agent  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Agent Remove failed: ", err);
                    throw err;
                })
        } else {

            return await Agent.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Agent Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Agent Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Agent
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
agentController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Agent.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Agent  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Agent Update failed: ", err);
                    throw err;
                })
        } else {
            return await Agent.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Agent Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Agent Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new agentController();
