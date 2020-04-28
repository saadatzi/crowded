const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'Log'},
    deviceId: {type: Schema.Types.ObjectId, ref: 'Device'},
    method: String,
    path: String,
    ip: String,
    token: String,
    browser: String,
    headers: Schema.Types.Mixed,
    body: Schema.Types.Mixed, //equivalent => Object / {}
    responseCode: Number,
    responseTime: Schema.Types.Decimal128,
    time: {type: Date, default: Date.now},
});

/**
 * Pre-remove hook
 */

LogSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
LogSchema.method({
});

/**
 * Statics
 */
LogSchema.static({
    /**
     * Find Log
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: (_id) => this.findById({_id})
        .then(log => {
            console.log("########## getById device: ", log);
            return log
        })
        .catch(err => console.log("!!!!!!!! Log getById catch err: ", err)),
    // get: (_id) => this.findById({_id}).exec(),



    /**
     * List all Log
     *
     * @param {Object} options
     * @api private
     */

    getAll: (options) => {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 50;
        return this.find(criteria)
            .sort({createdAt: -1})
            .limit(limit)
            .skip(limit * page)
            .catch(err => console.error("!!!!!!!!organization getAll catch err: ", err))
    }
});

const Log = mongoose.model('Log', LogSchema);
module.exports = Log;