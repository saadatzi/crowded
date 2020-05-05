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
 * Get BankName
 *
 * @param {Object || Array} optFilter
 *
 * @return {ObjectId} bankNameId
 */
bankNameController.prototype.get = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //newBankName instanceof Array
        return await BankName.getMany(optFilter)
            .catch(err => {
                console.error("!!!Interest getAll failed: ", err);
                throw err;
            })
    } else {
       //TODO: do sth here
    }
};



module.exports = new bankNameController();
