/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const eventController = require('./event');
const settings = require('../utils/settings');

const transactionController = function () {
};

/**
 * Add new Transaction
 *
 * @param {ObjectId} userId
 * @param {ObjectId} eventId
 *
 */
transactionController.prototype.add = async (userId, eventId) => {
    return eventController.get(eventId)
        .then(async event => {
            const addNewTransaction = {
                title_ar: event.title_ar,
                title_en: event.title_en,
                price: event.value,
                eventDate: event.from,
                userId: userId,
                eventId: eventId,
            };
            return await Transaction.create(addNewTransaction)
                .then(transaction => {
                    console.log("***Transaction save success transaction", transaction);
                    return transaction;
                })
                .catch(err => {
                    console.log("!!!Transaction save failed: ", err);
                    throw err;
                })
        })
        .catch(err => {
            console.log("!!!Event get failed: ", err);
            throw err;
        });
};


/**
 * get myTransaction
 *
 * @param {ObjectId} userId
 * @param {String} lang
 * @param {Number} page
 * @param {Date} date
 *
 * @return Event
 */
transactionController.prototype.myTransaction = async (userId, lang, page = 0, date = null) => {
    const dateFilter = date ? {
        startMonth: moment.unix(date).startOf('month').toDate(),
        endMonth: moment.unix(date).endOf('month').toDate()
    } : null;

    return await Transaction.getMyTransaction(userId, lang, page, dateFilter)
        .then(async event => event)
        .catch(err => {
            console.error("!!!get myTransaction failed: ", err);
            throw err;
        })

};

/**
 * get myTransaction Total
 *
 * @param {ObjectId} userId
 *
 * @return Event
 */
transactionController.prototype.myTransactionTotal = async (userId) => {

    return await Transaction.getMyTransactionTotal(userId)
        .then(async event => event)
        .catch(err => {
            console.error("!!!get myTransaction failed: ", err);
            throw err;
        })

};



/**
 * withdraw Transaction
 *
 * @param {ObjectId} userId
 * @param {ObjectId} bankId
 * @param {Number} total
 *
 * @return List Transaction
 */
transactionController.prototype.requestWithdraw = async (userId, bankId, total) => {
    return await Transaction.getTotalUnpaid(userId)
        .then(totalUnpaid => {
            //TODO duplicate
            console.log(">>>>>>>>>>>>>>>>>>>>>> requestWithdraw get totalUnpaid: %j, total: %s", totalUnpaid, total)
            if (Number(totalUnpaid.total) === Number(total)) {
                const addNewTransaction = {
                    title_ar: settings.wallet.withdrawTitle_ar,
                    title_en: settings.wallet.withdrawTitle_en,
                    price: -Math.abs(totalUnpaid.total),
                    eventDate: new Date(),
                    userId: userId,
                    eventId: null,
                    situation: "PENDING",
                    isDebtor: true
                };
                //Create new Transaction negative for withdrawn
                return Transaction.create(addNewTransaction)
                    .then(transaction => {
                        console.log("***Transaction withdraw save success transaction", transaction);
                        const updateFilter = {status: 1, userId: mongoose.Types.ObjectId(userId), situation: "UNPAID", isDebtor: false};
                        const updateValue = {situation: "PENDING"};
                        return newTransactionController.update(updateFilter, updateValue)
                            .then(result => {
                                console.log("***Transaction  withdraw Update: ", result);
                                return result;
                            })
                            .catch(err => {
                                console.log("!!!Transaction withdraw Update failed: ", err);
                                throw err;
                            })
                    })
                    .catch(err => {
                        console.log("!!!Transaction withdraw save failed: ", err);
                        throw err;
                    })
            } else {
                throw {code: 406, message: 'Your request has security issues!'}
            }
        })
        .catch(err => {
            console.error("!!!Transaction getAll failed: ", err);
            throw err;
        })
};

/**
 * get Transaction
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return List Transaction
 */
transactionController.prototype.get = async (optFilter, type = 'id') => {
    if (!optFilter || optFilter instanceof Object) { //newEvent instanceof Array
        return await Transaction.getAllMyInterestEvent(optFilter)
            .then(events => events)
            .catch(err => {
                console.error("!!!Transaction getAll failed: ", err);
                throw err;
            })
    } else {
        return await Transaction.getById(optFilter)
            .then(result => result)
            .catch(err => {
                console.log("!!!Transaction get failed: ", err);
                throw err;
            })
    }
};


/**
 * remove Transaction
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
transactionController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Transaction.remove(optFilter)
                .then(result => {
                    console.log("***Transaction  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Transaction Remove failed: ", err);
                    throw err;
                })
        } else {

            return await Transaction.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Transaction Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Transaction Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Transaction
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
transactionController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Transaction.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Transaction  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Transaction Update failed: ", err);
                    throw err;
                })
        } else {
            return await Transaction.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Transaction Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Transaction Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};
const newTransactionController = new transactionController();

module.exports = newTransactionController;
