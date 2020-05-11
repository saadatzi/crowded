const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportUserSchema = new Schema({
    userId: {type: Schema.ObjectId, ref: 'User'},
    eventId: {type: Schema.ObjectId, ref: 'Event'},
    cause: String,
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    result: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    reporter: {type: Schema.ObjectId, ref: 'Admin'},
    isDeleted: {type: Boolean, default: false}
}, {timestamps: true});
ReportUserSchema.index({userId: 1, eventId: 1}, {unique: true});


/**
 * Pre-remove hook
 */
ReportUserSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
ReportUserSchema.method({});

/**
 * Statics
 */
ReportUserSchema.static({
    /**
     * Find reportUser by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(reportUser => reportUser)
            .catch(err => console.error("!!!!!!!! Event getById catch err: ", err))
    },


    /**
     * Find reportUser current
     *
     * @param {Object} criteria
     * @api private
     */
    getOne: function (criteria) {
        return this.findOne(criteria)
            .then(reportUser => reportUser)
            .catch(err => console.error("!!!!!!!! Event getCurrent catch err: ", err))
    },


    /**
     * List all reportUser
     *
     * @param {Object} options
     * @api private
     */
    getAll: async function (options) {
        console.error("!!!!!!!! getAll Event options: ", options)
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
            .then(reportUsers => reportUsers)
            .catch(err => console.error("reportUser getAll Catch", err));
    },

});

const ReportUser = mongoose.model('ReportUser', ReportUserSchema);
module.exports = ReportUser;