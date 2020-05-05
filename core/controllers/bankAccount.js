/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const BankAccount = require('../models/BankAccount');


const bankAccountController = function () {
};

/**
 * Add new BankAccount
 *
 * @param {Object || Array} newBankAccount
 *
 * @return {ObjectId} bankAccountId
 */
bankAccountController.prototype.add = async (userId, newBankAccount) => {
    let payload = {
        userId,
        ...newBankAccount
    }
    return await BankAccount.create(payload)
        .then(bankaccount => {
            console.log("***BankAccount save success bankaccount._id", bankaccount._id);
            return bankaccount;
        })
        .catch(err => {
            console.error("!!!BankAccount save failed: ", err);
            throw err;
        })
};


/**
 * Get bank Account(s)
 * @param {Object || ObjectId} optFilter
 * @return {Array} bankAccountId
 */
bankAccountController.prototype.get = async (optFilter) => {
    //TODO: figure out how to pass lang for single fetch
    // S.Mahdi: this is a global. ipm new method.
    if (!optFilter || optFilter instanceof Object) {
        return await BankAccount.getMany(optFilter)
            .then(result => {
                console.log(`*** Fetched ${result.length} Accounts  by filter %j`, optFilter);
                return result;
            })
            .catch(err => {
                console.error("!!!BankAccount getAll failed: ", err);
                throw err;
            })
    } else {
        return await BankAccount.getById(optFilter)
            .then(result => {
                console.log(`***BankAccount getById ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.error("!!!BankAccount getById failed: ", err);
                throw err;
            })
    }
};


/**
 * Validation Account
 * @param {ObjectId} userId
 * @param {ObjectId} accountId
 * @return {Boolean} valid account for user
 */
bankAccountController.prototype.validation = async (userId, accountId) => {
    return await BankAccount.findOne({_id: mongoose.Types.ObjectId(accountId), userId: mongoose.Types.ObjectId(userId)})
        .then(result => !!result)
        .catch(err => {
            console.error("!!!BankAccount getById failed: ", err);
            throw err;
        })
};

/**
 * Change bank Account status
 * @param {ObjectId} id desired account's _id
 * @param {Number} newStatus desired status to set
 * @return {Array} bankAccountId
 */
bankAccountController.prototype.changeStatus = async (id, newStatus) => {
    return await BankAccount.changeStatus(id, newStatus)
        .then(result => {
            return result;
        })
        .catch(err => {
            console.error("!!!BankAccount delete failed: ", err);
            throw err;
        })
};


module.exports = new bankAccountController();
