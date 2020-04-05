const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterestSchema = new Schema({
    title_ar: {type: String, default: '', index: true},
    title_en: {type: String, default: '', index: true},
    image: {type: String, default: ''},
    order: {type: Number, default: 0},
    status: {type: Number, default: 0}, // 0 active, 1 deActive, 2 softDelete, 3 hardDelete
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now}
});

// function imageClient(image) {
//     return {
//         image: {
//             url: image
//         }
//     }
// };
//
// InterestSchema.virtual('id').get(() => this._id);
// InterestSchema.virtual('title').get(() => this.title_en);
//
// InterestSchema.virtual('selected', {
//     localField: '_restaurant',
//     foreignField: '_id',
//     ref: 'User',
//     justOne: true
// });
//
// InterestSchema.set('toObject', {virtuals: true});
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
    transform: function(lang) {
        return {
            id: this._id,
            title: this[`title_${lang}`],
            image: {url: this.image}
        };
    }
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
     * Interest list
     */
    list: async () => {
        return await Interest.find({status: 0})
            // .select({title_ar: 1, image: 1})
            .sort({order: 1})
            .exec()
            .then(interests => interests)
            .catch(err => console.log("Interest getAll Catch", err));
    },

    /**
     * List all Interest
     *
     * @param {Object} options
     * @api private
     */
    getAll: async (options) => {
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