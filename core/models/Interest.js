const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');

const InterestSchema = new Schema({
    title_ar: { type: String, default: '', unique: true },
    title_en: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: { type: Number, default: 1 }, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
}, { timestamps: true, toJSON: { virtuals: false, getters: false }, toObject: { virtuals: false } });


// InterestSchema.index({ title_ar: 1, type: -1 });
// InterestSchema.index({ title_en: 1, type: -1 });

// function imageClient(image) {
//     return {url: settings.media_domain+image}
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
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
InterestSchema.method({
    transform: function (selected = [], lang) {
        return {
            id: this._id,
            title: this[`title_${lang}`],
            image: { url: settings.media_domain + this.image },
            selected: selected.includes(this._id)
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
    get: function (_id) { return this.findById({ _id }).exec() },

    /**
     * Interest list
     */
    list: async function () {
        return await this.find({ status: 1 })
            // .select({id: 1, title: 1, image: 1})
            .sort({ order: 1 })
            .exec()
            .then(interests => interests)
            .catch(err => console.log("Interest getAll Catch", err));
    },

    /**
     * List all Interest for panel
     *
     * @param {Object} options
     * @api private
     */
    async getManyPanel(optFilter) {
        optFilter.search = optFilter.search || "";
        optFilter.filters = optFilter.filters || {};
        const page = optFilter.page || 0;
        const limit = optFilter.limit || 50;
        // TODO: add limit,page,sort, etc.

        let items = await this.aggregate([
            {
                $match: {}
            },
            {
                $match:optFilter.filters
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title_en: 1,
                    title_ar: 1,
                    order:1,
                    image: {
                        url: {$concat:[settings.media_domain, "$image"]}
                    },
                    status:1
                }
            }
        ]).catch(err => console.error(err));

        return { options: optFilter, items };

        return await Interest.find(criteria, options.field || '')
            .sort({ order: -1 })
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(result => result)
            .catch(err => console.log("Interest getAll Catch", err));
    },

    /**
     * Get one interest for panel
     * @param {Object} options
     */
    async getOnePanel(options) {
        if (!options) throw { message: "Missing criteria for Interest.getOnePanel!" };
        options._id = mongoose.Types.ObjectId(options._id);
        return await this.aggregate([
            {
                $match: options
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title_en: 1,
                    title_ar: 1,
                    order:1,
                    image: {
                        url: {$concat:[settings.media_domain, "$image"]}
                    },
                    createdAt:1,
                    updatedAt: 1,
                    status:1
                }
            }
            ]).catch(err => console.error(err));

    }
});

const Interest = mongoose.model('Interest', InterestSchema);
module.exports = Interest;