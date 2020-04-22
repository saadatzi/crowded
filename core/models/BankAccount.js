const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BankAccountSchema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'User', required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    bankNameId: { type: Schema.ObjectId, ref: 'BankName', required: true },
    IBAN: { type: String, required: true },
    civilId: { type: String, required: true },
    status: { type: Number, default: 1 }, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
},
    {
        timestamps: true
    });





/**
 * Methods
 */
BankAccountSchema.method({
});

/**
 * Statics
 */
BankAccountSchema.static({
    /**
     * Find account by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById(_id) {
        return this.findById(_id)//TODO: populate bank name via aggregation
            .catch(err => {
                console.error("!!!!!!!! BankAccount getById catch err: ", err);
                throw err;
            })
    },

    /**
    * Get all accounts
    *
    * @param {Object} options
    * @api private
    */
    getAll(options) {
        const originalCriteria = options.criteria || {};
        const lang = options.lang;
        const modifiedCriteria = {};

        originalCriteria.userId ? modifiedCriteria.userId = mongoose.Types.ObjectId(originalCriteria.userId) : null;

        // const page = options.page || 0;
        // const limit = options.limit || 30;

        return this.aggregate([
            { $match: modifiedCriteria },
            { $sort: { createdAt: -1 } },
            // {$skip: limit * page},
            // {$limit: limit + 1},
            {
                $lookup: {from: 'banknames', localField: 'bankNameId', foreignField: '_id', as: 'bankNameObject'}
            },
            {
                $project: {
                    _id: 0,
                    id:'$_id',
                    firstname: 1,
                    lastname: 1,
                    IBAN: 1,
                    bankName: `$bankNameObject.name_${lang}`
                }
            },
            {
                $unwind:"$bankName"
            }
        ])
            .catch(err => {
                console.error(`BankAccount get all failed with criteria ${JSON.stringify(criteria)}`,err);
                throw err;
            });

    }
});

const BankAccount = mongoose.model('BankAccount', BankAccountSchema);

module.exports = BankAccount;