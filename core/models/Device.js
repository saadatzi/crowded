const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    userId: {type: Number, index: true},
    debug: {type: Number, default: 0},
    identifier: {type: String, index: true},
    token: {type: String, index: true},
    status: {type: Number, default: 1 },
    notificationToken: {type: String, index: true},
    notificationTokenDev: {type: String, index: true},
    osType: String,
    osVersion: String,
    title: String,
    name: String,
    capacity: String,
    version: String,
    build: Number,
    env: String,
    lastInteract: { type: Date, default: Date.now },
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
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
    //ToDo method need... this.model('Animal')
});

/**
 * Statics
 */
DeviceSchema.static({
    /**
     * Find device by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: (_id) => this.findById({_id}).exec(),

    /**
     * Find device by identifier
     *
     * @param {String} identifier
     * @api private
     */
    getByIdentifier: (identifier) => {
        return Device.findOne({identifier: identifier})
            .then(device => {
                console.log("########## getByIdentifier device: ", device)
                return device
            })
            .catch(err => console.log("!!!!!!!! getByIdentifier catch err: ", err));
            // console.log("########## getByIdentifier device: ", device)
            // if (err) {
            // }
            // return (device)
        // });
        /*return new Promise(resolve => {
            this.findOne({identifier: identifier}, (err, device) => {
                if (err) {}
                resolve(device)
            })
        });*/
    },

    /**
     * List all device
     *
     * @param {Object} options
     * @api private
     */
    getAll: (options) => {
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