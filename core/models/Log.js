const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'Log', index: true},
    deviceId: {type: Schema.Types.ObjectId, ref: 'Device', index: true},
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
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
LogSchema.method({
    //ToDo method need... this.model('Interest')
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
            .exec(function (err, res) {
                if (err) return {}; //ToDo logger
                console.log(res);
                return res;
            });
    }
});

const Log = mongoose.model('Log', LogSchema);
module.exports = Log;