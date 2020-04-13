const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserEventSchema = new Schema({
    status: {
        type: String,
        enum: ['APPLIED', 'APPROVED', 'REJECTED', 'ACTIVE', 'LEFT', 'PAUSED', 'SUCCESS'],
        default: 'APPLIED'
    },
    userId: {type: Schema.ObjectId, ref: 'User'},
    eventId: {type: Schema.ObjectId, ref: 'Event'},
    feedbackDesc: String,
    feedbackTitle: String,
    star: Number,

    createAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
});
UserEventSchema.index({userId: 1, eventId: 1}, {unique: true});

/**
 * Pre-remove hook
 */

UserEventSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
UserEventSchema.method({});

/**
 * Statics
 */
UserEventSchema.static({
    /**
     * Find userEvent by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(userEvent => userEvent)
            .catch(err => console.log("!!!!!!!! Event getById catch err: ", err))
    },


    /**
     * Find userEvent current
     *
     * @param {Object} criteria
     * @api private
     */
    getOne: function (criteria) {
        return this.findOne(criteria)
            .then(userEvent => {
                console.log(">>>>>>>>>>>>>1 Event getCurrent userEvent: ", userEvent)
                return userEvent})
            .catch(err => console.log("!!!!!!!! Event getCurrent catch err: ", err))
    },


    /**
     * List all userEvent
     *
     * @param {Object} options
     * @api private
     */
    getAll: async function (options) {
        console.log("!!!!!!!! getAll Event options: ", options)
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return await this.find(criteria)
            // .sort({createAt: -1})
            .sort({'images.order': 1})
            .populate('interests')
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(userEvents => userEvents)
            .catch(err => console.log("Event getAll Catch", err));
    }
});

const UserEvent = mongoose.model('UserEvent', UserEventSchema);
module.exports = UserEvent;