const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');


const OrganizationSchema = new Schema({
    title: {type: String, unique: true, required: [true, "can't be blank"]},
    status: {type: Number, default: 1},
    image: {type: String, default: ''},
    address: {type: String, default: ''},
    phones: [{type: String}],
    commissionPercentage: {type: Number, default: 1},
}, {timestamps: true});


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
        return this.findById({_id})
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
        const baseCriteria = {status: {$in: [0, 1]}};

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                title: {$regex: regex, $options: "i"}
            };
            if(optFilter.search.length>7){
                regexMatch.$or.push({
                    phones: {$regex: regex, $options:"i"}
                })
            }
        }


        return this.aggregate([
            {$match: baseCriteria},
            {$match: regexMatch},
            {$match: optFilter.filters},
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                    image: {
                        $cond: [
                            {$ne: ["$image", ""]},
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
                        {$match: regexMatch},
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
        const baseCriteria = {_id:  mongoose.Types.ObjectId(optFilter._id), status: {$in: [0, 1]}};
        if (!optFilter) throw {message: "Missing criteria for Organization.getOnePanel!"};

        console.log(optFilter);
        return await this.aggregate([
            {$match: baseCriteria},
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    address: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    phones: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                    commissionPercentage: 1,
                    image: {
                        $cond: [
                            {$ne: ["$image", ""]},
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
    async setStatus(id, newStatus, validateCurrent = function (old) {
        return true
    }) {
        let record = await this.findOne({_id: id}).catch(err => console.error(err));
        let currentState = record.status;
        if (!validateCurrent(currentState)) throw {message: "Changing status not permitted!"};
        record.status = newStatus;
        if (newStatus === 2) record.title = record.title + '_DELETED_' + Date.now();
        return record.save();
    }


});

const Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;