const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', index: true, default: null},
    token: {type: String, index: true},
    identifier: {type: String, index: true},
    status: {type: Number, default: 1 },
    interests: [{type: Schema.Types.ObjectId, ref: 'Interest'}],
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
    debug: {type: Number, default: 0},
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
    getById: (_id) => this.findById({_id})
        .then(device => {
            console.log("########## getById device: ", device);
            return device
        })
        .catch(err => console.log("!!!!!!!! getById catch err: ", err)),

    /**
     * Find device by identifier
     *
     * @param {String} identifier
     * @api private
     */
    getByIdentifier: (identifier) => {
        return Device.findOne({identifier: identifier})
            .then(device => device)
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
     * Find device by Token
     *
     * @param {String} token
     * @api private
     */
    getByToken: (token) => {
        return Device.findOne({token: token})
            .then(device => device)
            .catch(err => console.log("!!!!!!!! getByToken catch err: ", err));
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