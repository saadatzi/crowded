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
}, { timestamps: true });





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
    getManyForUser(userId, optFilter) {
        let matchUser = { userId: mongoose.Types.ObjectId(userId) };

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        firstname: { $regex: regex, $options: "i" }
                    },
                    {
                        lastname: { $regex: regex, $options: "i" }
                    }
                ]
            };
        }


        return this.aggregate([
            { $match:matchUser },
            { $match: regexMatch },
            { $match: optFilter.filters },
            { $sort: optFilter.sorts },
            { $skip: optFilter.pagination.page * optFilter.pagination.limit },
            { $limit: optFilter.pagination.limit },
            {
                $lookup: {
                    from: 'banknames',
                    let: { primaryBankNameId: "$bankNameId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$primaryBankNameId"] },
                                // status: 1 // TODO: hum?
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                name_en: 1,
                                name_ar: 1,
                                isActive: { $cond: { if: { $eq: ["$status", 1] }, then: true, else: false } }
                            }
                        }
                    ],
                    as: 'getBankNames'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    fullName: { $concat: ['$firstname', ' ', '$lastname'] },
                    IBAN: 1,
                    civilId: 1,
                    bankName: { $arrayElemAt: ['$getBankNames', 0] },
                    isActive: { $cond: { if: { $eq: ["$status", 1] }, then: true, else: false } },
                }
            },
            {
                $group: {
                    _id: null,
                    items: { $push: '$$ROOT' },
                }
            },
            {
                $lookup: {
                    from: 'users',
                    pipeline: [
                        { $match: regexMatch },
                        { $match: optFilter.filters },
                        { $count: 'total' },
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: { $arrayElemAt: ["$getTotal", 0] },
                }
            },
        ])
            .then(result => {
                console.warn("<<<<<<<<<<<<<<<<<<<<< BankAccount getManyForUser result: ", result);
                let items = [],
                    total = 0;
                if (result.length > 0) {
                    total = result[0].total.total;
                    delete result[0].total;
                    items = result[0].items;
                }
                optFilter.pagination.total = total;
                return { explain: optFilter, items };
            })
            .catch(err => console.error(err));


    },


    /**
     * 
     * @param {ObjectId} id 
     */
    getOnePanel(id){
        console.log(id);
        let matchUser = { _id: mongoose.Types.ObjectId(id) };

        return this.aggregate([
            { $match:matchUser },
            {
                $lookup: {
                    from: 'banknames',
                    let: { primaryBankNameId: "$bankNameId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$primaryBankNameId"] },
                                // status: 1 // TODO: hum?
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                name_en: 1,
                                name_ar: 1,
                                isActive: { $cond: { if: { $eq: ["$status", 1] }, then: true, else: false } }
                            }
                        }
                    ],
                    as: 'getBankNames'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    fullName: { $concat: ['$firstname', ' ', '$lastname'] },
                    IBAN: 1,
                    civilId: 1,
                    bankName: { $arrayElemAt: ['$getBankNames', 0] },
                    isActive: { $cond: { if: { $eq: ["$status", 1] }, then: true, else: false } },
                    createdAt:1,
                    updatedAt: 1
                }
            }
        ])
            .then(result => {
                console.warn("<<<<<<<<<<<<<<<<<<<<< BankAccount getOnePanel result: ", result);
                return result[0];
            })
            .catch(err => console.error(err));


    },
    


    /**
    * Get all accounts
    *
    * @param {Object} options
    * @api private
    */
    getMany(options) {
        const originalCriteria = options.criteria || {};
        const lang = options.lang;
        const modifiedCriteria = {};

        originalCriteria.userId ? modifiedCriteria.userId = mongoose.Types.ObjectId(originalCriteria.userId) : null;
        modifiedCriteria.status = options.criteria.status || 1;

        // const page = options.page || 0;
        // const limit = options.limit || 30;

        return this.aggregate([
            { $match: modifiedCriteria },
            { $sort: { createdAt: -1 } },
            // {$skip: limit * page},
            // {$limit: limit + 1},
            {
                $lookup: { from: 'banknames', localField: 'bankNameId', foreignField: '_id', as: 'bankNameObject' }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    firstname: 1,
                    lastname: 1,
                    IBAN: 1,
                    bankName: `$bankNameObject.name_${lang}`
                }
            },
            {
                $unwind: "$bankName"
            }
        ])
            .catch(err => {
                console.error(`BankAccount get all failed with criteria ${JSON.stringify(criteria)}`, err);
                throw err;
            });

    },

    /**
     * Change status and SAVE
     *
     * @param {ObjectId} id
     * @param {Number} newStatus
     * @api private
     * @returns {Promise} .save().catch()
     */
    changeStatus(id, newStatus) {
        return this.getById(id)
            .then(bankAccount => {
                if (newStatus == bankAccount.status) throw { message: 'Not permitted to fixstate on a status.' };
                bankAccount.status = newStatus;
                return bankAccount.save();
            })
            .catch(err => {
                throw err;
            });
    },


    /**
     * Checks to see if given bankNameId is related to any bankAccount
     *
     * @param {String} id
     * @api private
     */
    bankNameIsRelated: async function (id) {
        let result = await this.aggregate([
            { $match: { bankNameId: mongoose.Types.ObjectId(id) } }
        ])
            .catch(err => {
                console.error(`BankAccount bankNameIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
        return result.length != 0;
    },

    /**
     * Checks to see if given bankNameId is related to any bankAccount
     *
     * @param {String} id
     * @api private
     */
    deleteRelatedBankAccounts: async function (bankNameId) {
        let criteria = {
            bankNameId: bankNameId
        };
        return this.updateMany(criteria, { status: 2 })
            .catch(err => {
                console.error(`BankAccount deleteRelatedBankAccounts failed with criteria id:${id}`, err);
                throw err;
            });


    }

});

const BankAccount = mongoose.model('BankAccount', BankAccountSchema);

module.exports = BankAccount;