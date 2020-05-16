const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');

const UserSchema = new Schema({
    email: {type: String, index: true, lowercase: true, unique: true, required: [true, "can't be blank"]},
    interests: [{type: Schema.Types.ObjectId, ref: 'Interest'}],
    firstname: String,
    lastname: String,
    image: String,
    sex: Number,
    birthDate: Date,
    phone: String,
    nationality: String,
    salt: String,
    password: String,
    civilId: String,
    status: {type: Number, default: 1},
    lastIp: String,
    lastLogin: Date,
    lastInteract: Date,
}, {timestamps: true});

/**
 * Pre-remove hook
 */

UserSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
UserSchema.method({
    toJSON() {
        return {
            id: this._id,
            email: this.email,
            firstname: this.firstname,
            lastname: this.lastname,
            image: {url: settings.media_domain + this.image},
            sex: this.sex,
            birthDate: this.birthDate,
            phone: this.phone,
            nationality: this.nationality,
            civilId: this.civilId,
        }
    }
});

/**
 * Statics
 */
UserSchema.static({

    /**
     * Find User by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    async getById(_id) {
        return await this.findById({_id})
            .then(user => user)
            .catch(err => console.error("!!!!!!!!User getById catch err: ", err))
    },

    /**
     * Find User by id
     *
     * @param {ObjectId} id
     * @api private
     */
    async getByIdInterest(id) {
        return await this.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(id)}},
            {$project: {interests: 1}}
        ])
            .then(user => user[0])
            .catch(err => console.error("!!!!!!!!User getById catch err: ", err))
    },

    /**
     * Find use by email
     *
     * @param {String} email
     * @api private
     */
    getByEmail: async (email) => {
        return await User.findOne({email: email})
            .then(user => user)
            .catch(err => console.error("!!!!!!!! getByEmail catch err: ", err));
    },

    /**
     * List all User
     *
     * @param {Object} options
     * @api private
     */

    getAll: (options) => {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 50;
        return this.find(criteria)
            .sort({createdAt: -1})
            .limit(limit)
            .skip(limit * page)
            .catch(err => console.error("!!!!!!!!organization getAll catch err: ", err))
    },

    /**
     * List many users for panel
     *
     * @param {Object} optFilter
     * @api private
     */
    async getManyPanel(optFilter) {


        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        email: {$regex: regex, $options: "i"}
                    },
                    {
                        firstname: {$regex: regex, $options: "i"}
                    },
                    {
                        lastname: {$regex: regex, $options: "i"}
                    }
                ]
            };
        }


        return this.aggregate([
            {$match: {$and: [regexMatch, optFilter.filters]}},
            //get report count
            {
                $lookup: {
                    from: 'reportusers',
                    let: {primaryUserId: "$_id"},
                    pipeline: [
                        //TODO important report result
                        {$match: {$expr: {$eq: ["$$primaryUserId", "$userId"]}}},
                        {$count: 'total'},
                    ],
                    as: 'getReportTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    email: 1,
                    firstname: 1,
                    lastname: 1,
                    reportCount: {$cond: [{$arrayElemAt: ["$getReportTotal.total", 0]}, 99, 0],
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                }
            },
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            {
                $lookup: {
                    from: 'users',
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
            },
        ])
            .then(result => {
                console.warn("<<<<<<<<<<<<<<<<<<<<< User getManyPanel result: ", result);
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
     * Get
     *
     * @param {Object} optFilter
     * @api private
     */
    async getOnePanel(optFilter) {


        const baseCriteria = {status: {$in: [0, 1]}, _id: mongoose.Types.ObjectId(optFilter.id)};
        return await this.aggregate([
            {$match: baseCriteria},
            {
                $lookup: {
                    from: 'interests',
                    let: {'primaryInterest': '$interests'},
                    pipeline: [
                        {$match: {$expr: {$in: ["$_id", "$$primaryInterest"]}}},
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                title_ar: 1,
                                title_en: 1
                            }
                        }
                    ],
                    as: 'getInterests'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    interests: '$getInterests',
                    firstname: 1,
                    lastname: 1,
                    sex: 1,
                    email: 1,
                    nationality: 1,
                    birthDate: 1,
                    image: {
                        $cond: [
                            {$ne: ["$image", undefined]},
                            {$concat: [settings.media_domain, '$image']},
                            null
                        ]
                    },
                    phone: {
                        $cond: [
                            {$gt: ["$phone", null]},
                            '$phone',
                            null
                        ]
                    }
                }
            }
        ])
            .catch(err => console.error(err));


    },


    /**
     * List all User in Event
     *
     * @param {Object} optFilter
     * @api private
     */
    //TODO add pagination & filter
    async getAllInEvent(optFilter) {

        const criteria = {status: {$in: [0, 1]}};
        optFilter.filters = optFilter.filters || {};
        optFilter.sorts = (Object.keys(optFilter.sorts).length === 0 && optFilter.sorts.constructor === Object) ? {updatedAt: -1} : optFilter.sorts;
        optFilter.pagination = optFilter.pagination || {
            page: 0,
            limit: settings.panel.defaultLimitPage
        };

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                $or: [
                    {
                        title_en: {$regex: regex, $options: "i"}
                    },
                    {
                        title_ar: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_en: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_ar: {$regex: regex, $options: "i"}
                    }
                ]
            };
        }

        return await this.aggregate([
            {$match: criteria},
            {
                $lookup: {
                    from: 'userevents',
                    let: {primaryUserId: "$_id"},
                    pipeline: [
                        {$match: {eventId: mongoose.Types.ObjectId(optFilter.eventId)}},
                        {$match: {$expr: {$eq: ["$$primaryUserId", "$userId"]}}},
                        {$project: {_id: 0, status: "$status"}},
                    ],
                    as: 'getUserEvents'
                }
            },
            {$unwind: {path: "$getUserEvents", preserveNullAndEmptyArrays: false}},
            {$match: regexMatch},
            {$match: optFilter.filters},
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    firstname: 1,
                    lastname: 1,
                    image: {url: {$concat: [settings.media_domain, "$image"]}},
                    sex: 1,
                    nationality: 1,
                    status: '$getUserEvents.status'
                }
            },
            {$sort: {status: 1}},
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            //Get total
            {
                $lookup: {
                    from: 'users',
                    pipeline: [
                        {$match: criteria},
                        {
                            $lookup: {
                                from: 'userevents',
                                let: {primaryUserId: "$_id"},
                                pipeline: [
                                    {$match: {eventId: mongoose.Types.ObjectId(optFilter.eventId)}},
                                    {$match: {$expr: {$eq: ["$$primaryUserId", "$userId"]}}},
                                    {$project: {_id: 0, status: "$status"}},
                                ],
                                as: 'getCountUserEvents'
                            }
                        },
                        {$unwind: {path: "$getCountUserEvents", preserveNullAndEmptyArrays: false}},
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
            },
        ])
            // .exec()
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
            .catch(err => console.error("getAllInEvent  Catch", err));
    },


    /**
     * Checks to see if given interest is related to any user
     *
     * @param {String} id
     * @api private
     */
    interestIsRelated: async function (id) {
        let result = await this.aggregate([
            {$match: {interests: mongoose.Types.ObjectId(id)}}
        ])
            .catch(err => {
                console.error(`User interestIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
        return result.length != 0;

    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;