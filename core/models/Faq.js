const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportSchema = new Schema({
    question_en: {type: String, required: [true, "can't be blank"]},
    answer_en: {type: String, required: [true, "can't be blank"]},
    question_ar: {type: String, required: [true, "can't be blank"]},
    answer_ar: {type: String, required: [true, "can't be blank"]},
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
SupportSchema.method({
    toJSON() {
        return {
            id: this._id,
            question_ar: this.question_ar,
            question_en: this.question_en,
            answer_ar: this.answer_ar,
            answer_en: this.answer_en,
            order: this.order,
            isActive: this.status === 1,
        }
    }
});

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
     * Get All panel
     *
     * @api private
     */
    async panelList() {
        const baseCriteria = {status: {$in: [0, 1]}}
        return await this.aggregate([
            {$match: baseCriteria},
            {$sort: {order: 1}},
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    question_en: 1,
                    answer_en: 1,
                    question_ar: 1,
                    answer_ar: 1,
                    order: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                }
            },
        ])
            .then(result => {
                return result;
            })
            .catch(err => console.error("Faq List  Catch", err));
    },

    /**
     * Get All App
     *
     * @param {String} lang
     * @api private
     */
    async appList({lang}) {
        const baseCriteria = {status: 1};
        return await this.aggregate([
            {$match: baseCriteria},
            {$sort: {order: 1}},
            {
                $project: {
                    _id: 0,
                    question: `$question_${lang}`,
                    answer: `$answer_${lang}`,
                }
            },
        ])
            .then(result => {
                return result;
            })
            .catch(err => console.error("Faq List  Catch", err));
    },


    /** appList
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
