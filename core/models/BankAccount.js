const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BankAccountSchema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'User', required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    bankNameId: { type: Schema.ObjectId, ref: 'BankName', required: true },
    IBAN: { type: String, required: true },
    civilId: { type: String, required: true },
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
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
});

const BankAccount = mongoose.model('BankAccount', BankAccountSchema);

module.exports = BankAccount;