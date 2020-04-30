const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');


const OrganizationSchema = new Schema({
    title: { type: String, unique: true, required: [true, "can't be blank"] },
    status: { type: Number, default: 1 },
    image: { type: String, default: '' },
    address: { type: String, default: '' },
    phones: [{
        type: String
    }]
}, { timestamps: true });


/**
 * Pre-remove hook
 */

OrganizationSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
OrganizationSchema.method({
    toJSON() {
        return {
            id: this._id,
            title: this.title,
            isActive: !!this.status,
        }
    }
});

/**
 * Statics
 */
OrganizationSchema.static({

    /**
     * Find Organization by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getByI(_id) {
        return this.findById({ _id })
            .then(organization => organization)
            .catch(err => console.error("!!!!!!!!organization getById catch err: ", err))
    },


    /**
     * List all Organizations
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

        // TODO: do it the right way
        // Absolutely not a rational decision - Kazem
        // Didn't have time to do it the right way - Kazem
        let total = await this.aggregate([
            // { $match: { $text: { $search: optFilter.search } } },
            { $match: optFilter.filters },
            // { $sort: { score: { $meta: "textScore" } } },
            { $count: 'total' },
            { $project: { total: "$total" } }
        ])
            .catch(err => console.error(err));

        let items = await this.aggregate([
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
                    title: 1,
                    isActive: { $toBool: "$status" },
                    image: {
                        $cond:[
                            {$ne : ["$image",""]},
                            {$concat: [settings.media_domain, "$image"]},
                            null
                        ]
                    }
                }
            }
        ])
            .catch(err => console.error(err));

        optFilter.pagination.total = total[0].total;
        return { explain: optFilter, items };
    },

    /**
     * Get an Organization
     *
     * @param {Object} optFilter
     * @api private
     */
    async getOnePanel(optFilter) {
        if (!optFilter) throw { message: "Missing criteria for Organization.getOnePanel!" };
        optFilter._id = mongoose.Types.ObjectId(optFilter._id);

        console.log(optFilter);
        return await this.aggregate([
            { $match: optFilter },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    address: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    phones: 1,
                    isActive: { $toBool: "$status" },
                    image: {
                        $cond:[
                            {$ne : ["$image",""]},
                            {$concat: [settings.media_domain, "$image"]},
                            null
                        ]
                    }
                }
            }
        ])
            .then(org => org[0])
            .catch(err => console.error(err));

    }



});

const Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;