const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BankNameSchema = new Schema({
    name_en: { type: String, required: true },
    name_ar: { type: String, required: true },
    status: { type: Number, default: 1 }, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
},
    {
        timestamps: true
    });



/**
 * Methods
 */
BankNameSchema.method({
});

/**
 * Statics
 */
BankNameSchema.static({
    /**
    * Find BankName
    *
    * @param {ObjectId} _id
    * @api private
    */
    getById(_id) {

        return this.findById({ _id }).exec()
    },

    /**
     * Find BankNames (plural)
     *
     * @param {Object} options
     * @api private
     */
    getMany(options) {

        let lang = options.lang;
        let modifiedCriteria = {status: 1};

        return this.aggregate([
            {
                $match: modifiedCriteria
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    name: `$name_${lang}`
                }
            }
        ])
            .exec()
            .catch(err => {
                console.error(`!!!BankName getMany failed with options: ${JSON.stringify(options)}`, err);
            });


    },

    /**
     * Find BankNames for panel (plural)
     *
     * @param {Object} options
     * @api private
     */
    getListPanel(optFilter) {


        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        name_en: { $regex: regex, $options: "i" }
                    },
                    {
                        name_ar: { $regex: regex, $options: "i" }
                    }
                ]
            };
        }

        
        return this.aggregate([
            { $match: regexMatch },
            { $match: optFilter.filters },
            { $sort: optFilter.sorts },
            { $skip: optFilter.pagination.page * optFilter.pagination.limit },
            { $limit: optFilter.pagination.limit },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    name_en: 1,
                    name_ar: 1
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
                    from: 'banknames',
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
            return { explain: optFilter, items };
        })
            .catch(err => console.error(err));
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
            .then(bankName => {
                if(newStatus == bankName.status) throw {message: 'Not permitted to fixstate on a status.'};
                bankName.status = newStatus;
                return bankName.save();
            })
            .catch(err => {
                throw err;
            });
    },



});

const BankName = mongoose.model('BankName', BankNameSchema);

module.exports = BankName;