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


});

const BankName = mongoose.model('BankName', BankNameSchema);

module.exports = BankName;