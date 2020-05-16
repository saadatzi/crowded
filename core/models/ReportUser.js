const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');

const ReportUserSchema = new Schema({
    userId: {type: Schema.ObjectId, ref: 'User'},
    eventId: {type: Schema.ObjectId, ref: 'Event'},
    cause: {type: String, required: [true, "cause can't be blank"]},
    desc: String,
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    result: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    reporterId: {type: Schema.ObjectId, ref: 'Admin'},
    isDeleted: {type: Boolean, default: false}
}, {timestamps: true});
ReportUserSchema.index({userId: 1, eventId: 1}, {unique: true});


/**
 * Pre-remove hook
 */
ReportUserSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
ReportUserSchema.method({});

/**
 * Statics
 */
ReportUserSchema.static({
    /**
     * Find reportUser by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(reportUser => reportUser)
            .catch(err => console.error("!!!!!!!! Event getById catch err: ", err))
    },

    /**
     * List Report for panel
     *
     * @param {Object} optFilter
     * @api private
     */
    async getManyPanel(optFilter) {

        console.warn('@@@@@@@@@@@@@@@@@@ Report manyPanel optFilter: ', optFilter);
        const baseCriteria = {isDeleted: false};

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        title_en: {$regex: regex, $options: "i"}
                    },
                    {
                        title_ar: {$regex: regex, $options: "i"}
                    }
                ]
            };
        }

        if (optFilter.filters.userId) optFilter.filters.userId = mongoose.Types.ObjectId(optFilter.filters.userId);

        return this.aggregate([
            {$match: {$and: [baseCriteria, regexMatch, optFilter.filters]}},
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            //get reporter info
            {
                $lookup: {
                    from: 'admins',
                    let: {primaryAdminId: "$reporterId"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$$primaryAdminId", "$_id"]}}},
                        //get organization info
                        {
                            $lookup: {
                                from: 'organizations',
                                let: {primaryOrgId: "$organizationId"},
                                pipeline: [
                                    {$match: {$expr: {$eq: ["$$primaryOrgId", "$_id"]}}},
                                    {
                                        $project: {
                                            _id: 0,
                                            id: '$_id',
                                            title: 1,
                                            image: {
                                                $cond: [
                                                    {$ne: ["$image", ""]},
                                                    {url: {$concat: [settings.media_domain, "$image"]}},
                                                    null
                                                ]
                                            }
                                        }
                                    },
                                ],
                                as: 'getOrganization'
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                name: 1,
                                organization: {$arrayElemAt: ["$getOrganization", 0]}
                            }
                        },
                    ],
                    as: 'getAdmin'
                }
            },
            //get Event info
            {
                $lookup: {
                    from: 'events',
                    let: {primaryEventId: "$eventId"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$$primaryEventId", "$_id"]}}},
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                title: "$title_en",
                            }
                        },
                    ],
                    as: 'getEvent'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    cause: 1,
                    desc: 1,
                    priority: 1,
                    event: {$arrayElemAt: ["$getEvent", 0]},
                    reporter: {$arrayElemAt: ["$getAdmin", 0]}
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
                    from: 'reportusers',
                    pipeline: [
                        {$match: {$and: [baseCriteria, regexMatch, optFilter.filters]}},
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
                return {explain: optFilter, items};
            })
            .catch(err => console.error(err));


    },
});

const ReportUser = mongoose.model('ReportUser', ReportUserSchema);
module.exports = ReportUser;