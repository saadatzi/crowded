const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Device Schema
 *
 */
const SessionSchema = new Schema({
    token: {type: String, default: ''},
    device: {type: Schema.ObjectId, ref: 'Device'},
    lastUse: {type: Date, default: Date.now},
    createAt: {type: Date, default: Date.now}
});

/**
 * Pre-remove hook
 */

SessionSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
SessionSchema.method({
    /**
     * Update [token]
     *
     * @param {String} token
     * @api private
     */
    setToken: async function (token) {
        console.log('session model methods update token: ', token);
        return await this.updateOne({token: token});
        /*this.model('Session').update(
            { _id: 1 },
            {$set: {token: token}}
        )

        console.log('session model methods update token: ', token);
        token ? this.model('Session').token = token : null;
        this.model('Session').lastUse = Date.now;
        return await this.save();*/
    }
});

/**
 * Statics
 */
SessionSchema.static({
    /**
     * Find session
     *
     * @param {ObjectId} _id
     * @api private
     */
    load: async function (_id) {
        return await this.findById({_id});
    },


    /**
     * List all device
     *
     * @param {Object} options
     * @api private
     */

    list: function (options) {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
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

const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;