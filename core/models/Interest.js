const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');

const InterestSchema = new Schema({
    title_ar: { type: String, default: '' },
    title_en: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: { type: Number, default: 1 }, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
}, { 
    timestamps: true,
    toJSON: { virtuals: false, getters: false },
    toObject: { virtuals: false },
    autoIndex: false 
});





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
        const baseCriteria = {status: 1};

        return await this.find(baseCriteria)
            // .select({id: 1, title: 1, image: 1})
            .sort({ order: 1 })
            .exec()
            .then(interests => interests)
            .catch(err => console.error("Interest getAll Catch", err));
    },

    /**
     * List all Interest for panel
     *
     * @param {Object} optFilter
     * @api private
     */
    async getManyPanel(optFilter) {
        const baseCriteria = {status: {$in: [0, 1]}};
        optFilter.filters = optFilter.filters || {};
        optFilter.sorts = optFilter.sorts || {
            title_en: 1
        };
        optFilter.pagination = optFilter.pagination || {
            page: 0,
            limit: settings.panel.defaultLimitPage
        };
        
        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        title_en: { $regex: regex, $options: "i" }
                    },
                    {
                        title_ar: { $regex: regex, $options: "i" }
                    }
                ]
            };
        }

        
        return this.aggregate([
            { $match: baseCriteria },
            { $match: regexMatch },
            { $match: optFilter.filters },
            { $sort: optFilter.sorts },
            { $skip: optFilter.pagination.page * optFilter.pagination.limit },
            { $limit: optFilter.pagination.limit },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title_en: 1,
                    image: {
                        url: { $concat: [settings.media_domain, "$image"] }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    items: { $push: '$$ROOT' },
                }
            },
            {
                $lookup: {
                    from: 'interests',
                    pipeline: [
                        { $match: regexMatch },  
                        { $match: optFilter.filters },
                        { $count: 'total' },
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: { $arrayElemAt: ["$getTotal", 0] },
                }
            },
        ])
        .then(result => {
            let items = [],
                total = 0;
            if (result.length > 0) {
                total = result[0].total.total;
                delete result[0].total;
                items = result[0].items;
            }
            optFilter.pagination.total = total;
            return { explain: optFilter, items };
        })
            .catch(err => console.error(err));


    },

    /**
     * Get one interest for panel
     * @param {Object} options
     */
    async getOnePanel(options) {
        const baseCriteria = {status: {$in: [0, 1]}, _id: mongoose.Types.ObjectId(options._id)};
        if (!options) throw { message: "Missing criteria for Interest.getOnePanel!" };
        return await this.aggregate([
            {$match: baseCriteria},
            {$match: options},
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title_en: 1,
                    title_ar: 1,
                    order: 1,
                    image: {
                        url: { $concat: [settings.media_domain, "$image"] }
                    },
                    createdAt: 1,
                    updatedAt: 1,
                    status: 1
                }
            }
        ]).catch(err => console.error(err));

    },

    /**
     * 
     * @param {String} id - id of the record
     * @param {Number} newStatus - new status you want to set
     * @param {Number} validateCurrent - a function returning a boolean checking old status
     */
    async setStatus(id, newStatus, validateCurrent = function(old){return true}) {
        let record = await this.findOne({_id:id}).catch(err=>console.error(err));
        let currentState = record.status;
        if (!validateCurrent(currentState)) throw {message:"Changing status not permitted!"};
        record.status = newStatus;
        return record.save();
    }
});

const Interest = mongoose.model('Interest', InterestSchema);



module.exports = Interest;