/**
 * Module dependencies.
 */

// const mongoose = require('mongoose');
// const Session = mongoose.model('Session');
const Session = require('../models/Session');


let SessionController = function () {
};

/**
 * Add new Session
 *
 * @param {Object} newSession
 *
 * @return {ObjectId} sessionId
 */
SessionController.prototype.add = async function (newSession) {
    const session = new Session(newSession);
    return await session.save()
        .then(_session => {
            console.log("***session save success room._id: ", _session._id);
            return _session;
        })
        .catch(err => {
            console.log("!!!session save field: ", err);
            return -1;
        })
};

/**
 * Session update
 *
 * @param {ObjectId} _id
 * @param {Session} session
 * @param {String} newToken
 */
SessionController.prototype.update = async function (session, _id, newToken = null) {
    // session.setToken(newToken)
    /*Session.load(_id)
        .then(session => {
            if (session) {
                console.log('session load success: ', session);
                session.update(newToken)
            } else {
                throw new Error('not find session whit _id: ' + _id)
            }
        })
        .catch(err => console.log("!!!session load on catch err: ", err));*/

};

module.exports = new SessionController();
