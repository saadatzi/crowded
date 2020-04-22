/**
 * Module dependencies.
 */
const BankAccount = require('../models/BankAccount');


const bankAccountController = function () {
};

/**
 * Add new Area
 *
 * @param {Object || Array} newBankAccount
 *
 * @return {ObjectId} bankAccountId
 */
bankAccountController.prototype.add = async (newBankAccount) => {
    if (Array.isArray(newBankAccount)) { //newArea instanceof Array
        return await BankAccount.insertMany(newBankAccount)
            .then(() => {})
            .catch(err => {
                console.error("!!!BankAccount many save failed: ", err);
                return -1;
            })
    } else {
        return await BankAccount.create(newBankAccount)
            .then(bankaccount => {
                console.log("***BankAccount save success bankaccount._id", bankaccount._id);
                return bankaccount;
            })
            .catch(err => {
                console.error("!!!BankAccount save failed: ", err);
                return -1;
            })
    }
};

// /**
//  * get Area
//  *
//  * @param {Object || ObjectId} optFilter
//  *
//  * @return Area
//  */
// areaController.prototype.get = async (optFilter) => {
//     if (!optFilter || optFilter instanceof Object) { //newArea instanceof Array
//         return await Area.list()
//             .then(interests => {
//                 let returnedAreas = [];
//                 interests.map(interest => returnedAreas.push(interest.transform(optFilter.selected, optFilter.lang)));
//                 return returnedAreas;
//             })
//             .catch(err => {
//                 console.log("!!!Area getAll failed: ", err);
//                 throw err;
//             })
//     } else {
//         return await Area.get(optFilter)
//             .then(result => {
//                 console.log(`***Area get by id ${optFilter} result: `, result);
//                 return result;
//             })
//             .catch(err => {
//                 console.log("!!!Area get failed: ", err);
//                 return -1;
//             })
//     }
// };

// /**
//  * remove Area
//  *
//  * @param {Object || ObjectId} optFilter
//  *
//  * @return Query
//  */
// areaController.prototype.remove = async (optFilter) => {
//     if (optFilter) {
//         if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
//             return await Area.remove(optFilter)
//                 .then(result => {
//                     console.log("***Area  Remove many result: ", result);
//                     return result;
//                 })
//                 .catch(err => {
//                     console.log("!!!Area Remove failed: ", err);
//                     return -1;
//                 })
//         } else {
//             return await Area.findByIdAndRemove(optFilter)
//                 .then(result => {
//                     console.log(`***Area Remove by id ${optFilter} result: `, result);
//                     return result;
//                 })
//                 .catch(err => {
//                     console.log("!!!Area Remove failed: ", err);
//                     return -1;
//                 })
//         }
//     } else {
//         throw {errMessage: 'for remove Object conditions or Id is required!'}
//     }


// };

// /**
//  * Update Area
//  *
//  * @param {Object || ObjectId} optFilter
//  * @param {Object} newValue
//  *
//  * @return Query
//  */
// areaController.prototype.update = async (optFilter, newValue) => {
//     if (optFilter) {
//         if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
//             //ToDo return Query?!
//             return await Area.updateMany(optFilter, newValue)
//                 .then(result => {
//                     console.log("***Area  Update many result: ", result);
//                     return result;
//                 })
//                 .catch(err => {
//                     console.log("!!!Area Update failed: ", err);
//                     return -1;
//                 })
//         } else {
//             //ToDo return Query?!
//             return await Area.findByIdAndUpdate(optFilter, newValue)
//                 .then(result => {
//                     console.log(`***Area Update by id ${optFilter} result: `, result);
//                     return result;
//                 })
//                 .catch(err => {
//                     console.log("!!!Area Update failed: ", err);
//                     return -1;
//                 })
//         }
//     } else {
//         throw {errMessage: 'for Update Object conditions or Id is required!'}
//     }


// };

module.exports = new bankAccountController();