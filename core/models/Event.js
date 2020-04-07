const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title_ar: String,
    title_en: String,
    desc_ar: String,
    desc_en: String,
    images: [{
        url: String,
        order: Number
    }],
    value: {type: Schema.Types.Decimal128, default: 0},
    Attendance: {type: Number, default: 0},
    dateTime: Date,
    address: String,
    location: {
        lat: String,
        lon: String
    },
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
    interests: [{type: Schema.Types.ObjectId, ref: 'Interest'}],
    createAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
});

/**
 * Pre-remove hook
 */

EventSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
EventSchema.method({
    //ToDo method need... this.model('Animal')
});

/**
 * Statics
 */
EventSchema.static({
    /**
     * Find event by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function(_id) {
        return this.findById({_id})
        .then(event =>  event)
        .catch(err => console.log("!!!!!!!! Event getById catch err: ", err))},

    /**
     * Find event by identifier
     *
     * @param {String} identifier
     * @api private
     */
    getByIdentifier: (identifier) => {
        return Device.findOne({identifier: identifier})
            .then(event => event)
            .catch(err => console.log("!!!!!!!! getByIdentifier catch err: ", err));
        // console.log("########## getByIdentifier event: ", event)
        // if (err) {
        // }
        // return (event)
        // });
        /*return new Promise(resolve => {
            this.findOne({identifier: identifier}, (err, event) => {
                if (err) {}
                resolve(event)
            })
        });*/
    },


    /**
     * List all event
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

const Device = mongoose.model('Device', EventSchema);
module.exports = Device;