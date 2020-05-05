const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportSchema = new Schema({
    question: {type: String, required: [true, "can't be blank"]},
    answer: {type: String, required: [true, "can't be blank"]},
    order: Number,
    status: {type: Number, default: 1},
}, {timestamps: true});

/**
 * Pre-remove hook
 */

SupportSchema.pre('remove', function (next) {
    next();
});

/**
 * Methods
 */
SupportSchema.method({});

/**
 * Statics
 */
SupportSchema.static({

    /**
     * Find Faq by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(device => device)
            .catch(err => console.error("!!!!!!!!Faq getById catch err: ", err))
    },

    /**
     * Get All
     *
     * @param {String} token
     * @api private
     */
    async list() {
        const criteria = {status: {$in: [0, 1]}}
        return await this.aggregate([
            {$match: criteria},
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    question: 1,
                    answer: 1,
                    // permissions: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                }
            },
            {$sort: {id: 1}},
        ])
            .then(result => {
                // result.map(r => {
                //     r.permissions.map(rp => rp.accesssLevel = binLevel2Bool(rp.accessLevelNum))
                // });
                return result;
            })
            .catch(err => console.error("Faq List  Catch", err));
    },


    /**
     * List all Faq
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
    },

    /**
     *
     * @param {String} id - id of the record
     * @param {Number} newStatus - new status you want to set
     * @param {Number} validateCurrent - a function returning a boolean checking old status
     */
    async setStatus(id, newStatus, validateCurrent = function (old) {
        return true
    }) {
        return await this.findById(id)
            .then(result => {
                let currentState = result.status;
                if (!validateCurrent(currentState)) throw {message: "Changing status not permitted!"};
                result.status = newStatus;
                return result.save();
            })
            .catch(err => console.error(err));
    }
});

const Faq = mongoose.model('Faq', SupportSchema);
module.exports = Faq;
