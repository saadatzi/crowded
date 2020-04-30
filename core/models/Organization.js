const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    title_en: { type: String, unique: true, required: [true, "can't be blank"] },
    title_ar: { type: String, unique: true, required: [true, "can't be blank"] },
    status: { type: Number, default: 1 },
    image: { type: String, default: '' },
    address_en: { type: String, default: '' },
    address_ar: { type: String, default: '' },
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
            name: this.name,
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
     * @param {Object} options
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
                    title_en: 1,
                    image: 1
                }
            }
        ])
            .catch(err => console.error(err));

        optFilter.pagination.total = total[0].total;
        return { explain: optFilter, items };
    }



    });

const Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;