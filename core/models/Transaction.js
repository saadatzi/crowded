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
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now}
});
TransactionSchema.index({userId: 1, eventId: 1}, {unique: true});
TransactionSchema.plugin(AutoIncrement, {inc_field: 'transactionId'});


/**
 * Pre-remove hook
 */

TransactionSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
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
            .catch(err => console.log("!!!!!!!! Transaction getById catch err: ", err))
    },


    /**
     * List my Transaction
     *
     * @param {Object} userId
     * @param {String} lang
     * @param {Date} dateFilter
     * @param {Number} page
     * @param {Boolean} isPrevious
     */
    getMyTransaction: async function (userId, lang, page, dateFilter) {
        const criteria = {status: 1, userId: mongoose.Types.ObjectId(userId)};

        if (dateFilter) criteria.createdAt = {$gte: dateFilter.start, $lt: dateFilter.end};


        const limit = settings.wallet.limitPage;

        console.log("!!!!!!!! getAllMyEvent userId: ", userId)
        console.log("!!!!!!!! getAllMyEvent criteria: ", criteria)
        return await this.aggregate([
            {$match: criteria},
            {$sort: {createAt: -1}},
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
            //Get All UNPAID for withdraw
            {
                $lookup: {
                    from: 'transactions',
                    pipeline: [
                        {$match: criteria},
                        {$match: {situation: "UNPAID"}},
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
                        {$match: {$expr: {$and: [{$eq: [{$week: new Date()}, {$week: "$createdAt"}]}, {$eq: [{$year: new Date()}, {$year: "$createdAt"}]}]}}},
                        {$group: {_id: null, total: {$sum: "$price"}, count: {$sum: 1}}},
                        {$project: {_id: 0, total: {$toString: "$total"}, count: 1}},
                    ],
                    as: 'getWeek'
                }
            },
            {
                $project: {
                    _id: 0,
                    nextPage: {$cond: {if: {$gt: [{$size: "$items"}, limit]}, then: page + 1, else: null}},
                    items: {$slice: ["$items", limit]},
                    withdraw: {$arrayElemAt: ["$getUnpaid", 0]},
                    totalEarned: {$arrayElemAt: ["$getTotal", 0]},
                    thisWeek: {$arrayElemAt: ["$getWeek", 0]}

                }
            },
            {
                $project: {
                    items: 1,
                    withdraw: 1,
                    totalEarned: 1,
                    thisWeek: 1,
                    nextPage: 1,
                }
            }
        ])
            // .exec()
            .then(async transactions => transactions[0])
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
            .catch(err => console.log("Transaction getAll Catch", err));
    }
})
;

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;