const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const settings = require('../utils/settings');
// const moment = require('moment-timezone');
// mongoose.Types.ObjectId.isValid()
const BankAccountSchema = new Schema({
    firstname: String,
    lastname: String,
    // bankNameId: {type: Schema.ObjectId, ref: 'BankName'},
    IBAN: String,
    civilId: String,
},
{timestamps: true});



/**
 * Methods
 */
EventSchema.method({
});

/**
 * Statics
 */
EventSchema.static({
});

const BankAccount = mongoose.model('BankAccount', EventSchema);


// test
let test = new BankAccount({
    firstname: 'John',
    lastname: 'Doe',
    IBAN: '29347234029375203957235',
    civilId: '1'
});
test.save().then(t=>{
    console.log('------');
    console.log(t);
    console.log('------');
});
module.exports = BankAccount;