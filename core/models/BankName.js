const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BankNameSchema = new Schema({
    name_en: { type: String, required: true },
    name_ar: { type: String, required: true },
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
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
});

const BankName = mongoose.model('BankName', BankNameSchema);

module.exports = BankName;