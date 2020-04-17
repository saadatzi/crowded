const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings')

const TransactionSchema = new Schema({
    price: {type: Number, index: true},
    userEventIds: [{type: Schema.ObjectId, ref: 'UserEvent'}],
    refId: Schema.ObjectId,
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now}
});


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
    transform: function(selected = [], lang) {
        return {
            id: this._id,
            title: this[`title_${lang}`],
            image: {url: settings.media_domain+this.image},
            selected: selected.includes(this._id)
        };
    }
});

/**
 * Statics
 */
TransactionSchema.static({
    /**
     * Find transaction
     *
     * @param {ObjectId} _id
     * @api private
     */
    get: function(_id){ return this.findById({_id}).exec()},

    /**
     * Transaction list
     */
    list: async function() {
        return await this.find({status: 1})
            // .select({id: 1, title: 1, image: 1})
            .sort({order: 1})
            .exec()
            .then(transactions => transactions)
            .catch(err => console.log("Transaction getAll Catch", err));
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
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;