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





// index for search
InterestSchema.index({ title_en: 'text' , title_ar: 'text'});


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
     * @param {Object} optFilter
     * @api private
     */
    async getManyPanel(optFilter) {

        // TODO: enable search
        optFilter.search = optFilter.search || "";
        optFilter.filters = optFilter.filters || {
            status: 1
        };
        optFilter.sorts = optFilter.sorts || {
            title_en: 1
        };
        optFilter.pagination = optFilter.pagination || {
            page: 0,
            limit: 12
        };
        console.log(optFilter.search);

        
        return this.aggregate([
            // { $match: { $text: { $search: optFilter.search } } },
            { $match: optFilter.filters },
            // { $sort: { score: { $meta: "textScore" } } },
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
                        // { $match: { $text: { $search: optFilter.search } } },  
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

Interest.createIndexes()
.then(()=>{
    return Interest.collection.getIndexes({full: true});
})
.then(indexes => {
    console.log("indexes:", indexes);
    // ...
}).catch(console.error);

//shit 
// Interest.collection.dropIndexes({full:true})
// Promise.resolve(true)


module.exports = Interest;