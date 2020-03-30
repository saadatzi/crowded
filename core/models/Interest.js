const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterestSchema = new Schema({
    title_ar: {type: String, default: '', index: true},
    title_en: {type: String, default: '', index: true},
    image: {type: String, default: ''},
    order: {type: Number, default: 0},
    createdAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now }
});

/**
 * Pre-remove hook
 */

InterestSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
InterestSchema.method({
    //ToDo method need... this.model('Interest')
});

/**
 * Statics
 */
InterestSchema.static({
    /**
     * Find interest
     *
     * @param {ObjectId} _id
     * @api private
     */
    get: (_id) => this.findById({_id}).exec(),

    /**
     * List all Interest
     *
     * @param {Object} options
     * @api private
     */

    getAll: async (options) => {
        console.log("***Interest get All Model options: ", options);
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 50;
        return await Interest.find(criteria, options.field || '',)
            .sort({order: -1})
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(result => result)
            .catch(err => console.log("Interest getAll Catch", err));
    }
});

const Interest = mongoose.model('Interest', InterestSchema);
module.exports = Interest;