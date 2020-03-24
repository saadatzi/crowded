const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    uniqId: {type: String, default: '', index: true},
    ip: {type: String, default: ''},
    deviceName: {type: String, default: ''},
    brand: {type: String, default: ''},
    model: {type: String, default: ''},
    osName: {type: String, default: ''},
    osVersion: {type: String, default: ''},
    createdAt: { type: Date, default: Date.now }
});

/**
 * Pre-remove hook
 */

DeviceSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
DeviceSchema.method({
    //ToDo method need...
});

/**
 * Statics
 */
DeviceSchema.static({
    /**
     * Find device info
     *
     * @param {ObjectId} _id
     * @api private
     */

    load: function (_id) {
        return this.findOne({_id})
            .exec();
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

const Device = mongoose.model('Device', DeviceSchema);
module.exports = Device;