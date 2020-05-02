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
            },
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            {
                $lookup: {
                    from: 'organizations',
                    pipeline: [
                        // { $match: { $text: { $search: optFilter.search } } },  
                        {$match: optFilter.filters},
                        {$count: 'total'},
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: {$arrayElemAt: ["$getTotal", 0]},
                }
            }
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
            return {explain: optFilter, items};
        })
             .catch(err => console.error(err));
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

const Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;