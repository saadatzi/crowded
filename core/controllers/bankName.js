/**
 * Module dependencies.
 */
const BankName = require('../models/BankName');


const bankNameController = function () {
};

/**
 * Add new BankName
 *
 * @param {Object || Array} newBankName
 *
 * @return {ObjectId} bankNameId
 */
bankNameController.prototype.add = async (newBankName) => {

    if (Array.isArray(newBankName)) { //newArea instanceof Array
        return await BankName.insertMany(newBankName)
            .catch(err => {
                console.error("!!!BankName many save failed: ", err);
                throw err;
            })
    } else {
        return await BankName.create(newBankName)
            .then(bankName => {
                console.log("***BankName save success bankName._id", bankName._id);
                return bankName;
            })
            .catch(err => {
                console.error("!!!BankName save failed: ", err);
                throw err;
            })
    }
};

/**
 * Add new BankName
 *
 * @param {Object || Array} optFilter
 *
 * @return {ObjectId} bankNameId
 */
bankNameController.prototype.get = async (optFilter) => {
    // let fakeBanks = [
    //     {
    //         _id: "5ea00dd5d7cdb00f1c45bf7d",
    //         name: "Bank No.1"
    //     },
    //     {
    //         _id: "5ea00df96ed92bb2db24b1c4",
    //         name: "Bank No.2"
    //     },
    //     {
    //         _id: "5ea00dfec4c008a48a34db3b",
    //         name: "Bank No.3"
    //     }
    // ]
    // return fakeBanks;
    console.log('2309482309482903840923')
    console.log('2309482309482903840923')
    console.log(optFilter);
    console.log('2309482309482903840923')
    console.log('2309482309482903840923')

    if (!optFilter || optFilter instanceof Object) { //newBankName instanceof Array
        return await BankName.getMany(optFilter)
            .catch(err => {
                console.log("!!!Interest getAll failed: ", err);
                throw err;
            })
    } else {
       //TODO: do sth here
    }
};



module.exports = new bankNameController();
