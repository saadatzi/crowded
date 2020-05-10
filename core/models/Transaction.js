const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const settings = require('../utils/settings');

const TransactionSchema = new Schema({
    userId: {type: Schema.ObjectId, ref: 'User'},
    eventId: {type: Schema.ObjectId, ref: 'Event'},
    title_ar: String,
    title_en: String,
    price: {type: Schema.Types.Decimal128, default: 0},
    isDebtor: {type: Boolean, default: false},
    situation: {
        type: String,
        enum: ['PAID', 'UNPAID', 'FAILED', 'PENDING'],
        default: 'UNPAID'
    },
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
    eventDate: Date,
    accountId: {type: Schema.ObjectId, ref: 'BankAccount'},
}, {timestamps: true});
TransactionSchema.index({userId: 1, eventId: 1}, {unique: true});
TransactionSchema.plugin(AutoIncrement, {inc_field: 'transactionId'});


/**
 * Pre-remove hook
 */

TransactionSchema.pre('remove', function (next) {
    next();
});

/**
 * Pre-save hook
 */
TransactionSchema.pre('save', function (next) {
    if (this.eventId === null) this.eventId = mongoose.Types.ObjectId();
    next();
});

/**
 * Methods
 */
TransactionSchema.method({
    transform: function (selected = [], lang) {
        return {
            id: this._id,
            title: this[`title_${lang}`],
            image: {url: settings.media_domain + this.image},
            selected: selected.includes(this._id)
        };
    }
});

/**
 * Statics
 */
TransactionSchema.static({

    /**
     * Find transaction byId
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(transaction => transaction)
            .catch(err => console.error("!!!!!!!! Transaction getById catch err: ", err))
    },


    /**
     * List my Transaction
     *
     * @param {Object} userId
     * @param {String} lang
     * @param {Date} dateFilter
     * @param {Number} page
     */
    getMyTransaction: async function (userId, lang, page, dateFilter) {
        const criteria = {status: 1, userId: mongoose.Types.ObjectId(userId)};

        if (dateFilter) criteria.createdAt = {$gte: dateFilter.start, $lt: dateFilter.end};


        const limit = settings.wallet.limitPage;

        console.error("!!!!!!!! getMyTransaction userId: ", userId)
        console.error("!!!!!!!! getMyTransaction criteria: ", criteria)
        return await this.aggregate([
            {$match: criteria},
            {$sort: {createdAt: -1}},
            {$skip: limit * page},
            {$limit: limit + 1},
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: {$toString: `$title_${lang}`},
                    price: {$toString: "$price"},
                    eventDate: {$dateToString: {format: "%Y/%m/%d", date: "$eventDate", timezone: "Asia/Kuwait"}},
                    isDebtor: 1,
                    transactionId: 1
                },
            },
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            {
                $project: {
                    _id: 0,
                    nextPage: {$cond: {if: {$gt: [{$size: "$items"}, limit]}, then: page + 1, else: null}},
                    items: {$slice: ["$items", limit]},
                }
            },
            {
                $project: {
                    items: 1,
                    nextPage: 1,
                }
            }
        ])
            .then(async transactions => {
                return transactions[0]
            })
            .catch(err => console.error("getMyTransaction  Catch", err));
    },

    /**
     * List my Transaction Total
     *
     * @param {Object} userId
     */
    getMyTransactionTotal: async function (userId) {
        const criteria = {status: 1, userId: mongoose.Types.ObjectId(userId)};

        const monthAgo = new Date(new Date().getTime() - 2678400000);//31*24*60*60*1000

        console.error("!!!!!!!! getMyTransaction userId: ", userId)
        console.error("!!!!!!!! getMyTransaction criteria: ", criteria);
        return await this.aggregate([
            {$match: criteria},
            //Get one month ago
            {
                $lookup: {
                    from: 'transactions',
                    pipeline: [
                        {$match: criteria},
                        {$match: {isDebtor: false, createdAt: {$gt: monthAgo}}},
                        {
                            $project: {
                                _id: 0,
                                price: {$toString: "$price"},
                                eventDate: {
                                    $dateToString: {
                                        format: "%Y/%m/%d",
                                        date: "$eventDate",
                                        timezone: "Asia/Kuwait"
                                    }
                                }
                            }
                        },
                    ],
                    as: 'getMonthAgo'
                }
            },
            //Get All UNPAID for withdraw
            {
                $lookup: {
                    from: 'transactions',
                    pipeline: [
                        {$match: criteria},
                        {$match: {situation: "UNPAID", isDebtor: false}},
                        {$group: {_id: null, total: {$sum: "$price"}, count: {$sum: 1}}},
                        {$project: {_id: 0, total: {$toString: "$total"}, count: 1}},
                    ],
                    as: 'getUnpaid'
                }
            },
            //Get All Earned
            {
                $lookup: {
                    from: 'transactions',
                    pipeline: [
                        {$match: criteria},
                        {$match: {isDebtor: false}},
                        {$group: {_id: null, total: {$sum: "$price"}, count: {$sum: 1}}},
                        {$project: {_id: 0, total: {$toString: "$total"}, count: 1}},
                    ],
                    as: 'getTotal'
                }
            },
            //Get total Earned in current Week
            {
                $lookup: {
                    from: 'transactions',
                    pipeline: [
                        {$match: criteria},
                        {
                            $match: {
                                isDebtor: false,
                                $expr: {$and: [{$eq: [{$week: new Date()}, {$week: "$createdAt"}]}, {$eq: [{$year: new Date()}, {$year: "$createdAt"}]}]}
                            }
                        },
                        {$group: {_id: null, total: {$sum: "$price"}, count: {$sum: 1}}},
                        {$project: {_id: 0, total: {$toString: "$total"}, count: 1}},
                    ],
                    as: 'getWeek'
                }
            },
            {
                $project: {
                    _id: 0,
                    dataCart: "$getMonthAgo",
                    withdraw: {$arrayElemAt: ["$getUnpaid", 0]},
                    totalEarned: {$arrayElemAt: ["$getTotal", 0]},
                    thisWeek: {$arrayElemAt: ["$getWeek", 0]}

                }
            },
            {
                $project: {
                    dataCart: 1,
                    withdraw: {
                        $cond: {
                            if: {$gt: ["$withdraw.total", 0]},
                            then: "$withdraw",
                            else: {count: 0, total: '0'}
                        }
                    },
                    totalEarned: {
                        $cond: {
                            if: {$gt: ["$totalEarned.total", 0]},
                            then: "$totalEarned",
                            else: {count: 0, total: '0'}
                        }
                    },
                    thisWeek: {
                        $cond: {
                            if: {$gt: ["$thisWeek.total", 0]},
                            then: "$thisWeek",
                            else: {count: 0, total: '0'}
                        }
                    },
                }
            }
        ])
            .then(async transactions => {
                return transactions[0]
            })
            .catch(err => console.error("getMyTransaction  Catch", err));
    },

    /**
     * List my Transaction unpaid
     *
     * @param {Object} userId
     */
    getTotalUnpaid: async function (userId) {
        const criteria = {status: 1, userId: mongoose.Types.ObjectId(userId), situation: "UNPAID", isDebtor: false};
        return await this.aggregate([
            {$match: criteria},
            {$group: {_id: null, total: {$sum: "$price"}, count: {$sum: 1}}},
            {$project: {_id: 0, total: {$toString: "$total"}, count: 1}},
        ])
            // .exec()
            .then(async transactions => transactions[0])
            .catch(err => console.error("getMyTransaction  Catch", err));
    },

    /**
     * Panel List All Transaction
     *
     * @param {Object} optFilter
     */
    getPanel: async function (optFilter) {
        const criteria = {isDebtor: true};

        optFilter.filters = optFilter.filters || {};

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                $or: [
                    {
                        firstname: {$regex: regex, $options: "i"}
                    },
                    {
                        lastname: {$regex: regex, $options: "i"}
                    }
                ]
            };
        }

        return await this.aggregate([
            {$match: {$and: [criteria, optFilter.filters]}}, //Optimization
            // {$match: optFilter.filters},
            //get user info
            {
                $lookup: {
                    from: 'users',
                    let: {primaryUserId: "$userId"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$$primaryUserId", "$_id"]}}},
                        {$match: regexMatch},
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                fullName: {$concat: ['$firstname',' ', '$lastname']},
                                sex: 1,
                                nationality: 1,
                                image: {url: {$concat: [settings.media_domain, "$image"]}},
                                isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                            }
                        },
                    ],
                    as: 'getUser'
                }
            },
            {$unwind: {path: "$getUser", preserveNullAndEmptyArrays: false}},
            //get Account info
            {
                $lookup: {
                    from: 'bankaccounts',
                    let: {primaryAccountId: "$accountId"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$$primaryAccountId", "$_id"]}}},
                        {
                            $lookup: {
                                from: 'banknames',
                                foreignField: '_id',
                                localField: 'bankNameId',
                                as: "getBankName"
                            }
                        },
                        //get bank name
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                fullName: {$concat: ['$firstname',' ', '$lastname']},
                                IBAN: 1,
                                civilId: 1,
                                bankName: {$arrayElemAt: ['$getBankName.name_en', 0]}
                            }
                        },
                    ],
                    as: 'getAccount'
                }
            },
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    user: '$getUser',
                    account: '$getAccount',
                    situation: 1,
                    price: {$toString: "$price"},
                    date: {$dateToString: {/*format: "%Y/%m/%d %H:%M:%S",*/ date: "$eventDate", timezone: "Asia/Kuwait"}},
                    transactionId: 1
                },
            },
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                    total: {$sum: 1}
                }
            },
            //get Total
            {
                $lookup: {
                    from: 'transactions',
                    pipeline: [
                        {$match: criteria},
                        {$match: optFilter.filters},
                        {
                            $lookup: {
                                from: 'users',
                                let: {primaryUserId: "$userId"},
                                pipeline: [
                                    {$match: {$expr: {$eq: ["$$primaryUserId", "$_id"]}}},
                                    {$match: regexMatch},
                                ],
                                as: 'getUser'
                            }
                        },
                        {$unwind: {path: "$getUser", preserveNullAndEmptyArrays: false}},
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
            .then(async result => {
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
            .catch(err => console.error("getMyTransaction  Catch", err));
    },

    /**
     * List all Transaction
     *
     * @param {Object} options
     * @api private
     */
    getAll: async (options) => {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 50;
        return await Transaction.find(criteria, options.field || '',)
            .sort({order: -1})
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(result => result)
            .catch(err => console.error("Transaction getAll Catch", err));
    }
})
;

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;