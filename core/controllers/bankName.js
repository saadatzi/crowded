/**
 * Module dependencies.
 */
const BankName = require('../models/BankName');
const BankAccount = require('../models/BankAccount');


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



/**
 * Get BankNames
 *
 * @param {Object} optFilter
 *
 * @return {ObjectId} bankNameId
 */
bankNameController.prototype.getListPanel = async (optFilter) =>{
    return BankName.getListPanel(optFilter)
        .catch(err => console.error('get bank-name list failed!', err));     
};


/**
 * Edit BankName
 *
 * @param {Object || Array} optFilter
 *
 * @return {Object} bankName
 */
bankNameController.prototype.edit = async (optFilter) =>{
    let id = optFilter.id;
    delete optFilter.id;
    return BankName.findByIdAndUpdate(id,optFilter)
        .catch(err => console.error('edit bank-name failed!', err));     
};


/**
 * Delete BankName
 *
 * @param {ObjectId} id
 *
 */
bankNameController.prototype.delete = async (id) =>{
    // let id = optFilter.id;
    return BankName.changeStatus(id, 2)
        .then(()=>{
            return BankAccount.deleteRelatedBankAccounts(id);
        })
        .catch(err=>{
            console.error(err);
            throw err;
        })
    // delete optFilter.id;
    // return BankName.findByIdAndUpdate(id,optFilter)
    //     .catch(err => console.error('edit bank-name failed!', err));     
};





module.exports = new bankNameController();
