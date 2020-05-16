/**
 * Module dependencies.
 */

const eventController = require('./event');
const transactionController = require('./transaction');

const dashboardController = function () {
};

/**
 * Login User Panel
 *
 */
dashboardController.prototype.getStats = async (admin, optFilter, accessLevel) => {

    try {

        let totalEventsCount = await eventController.countTotal(admin._id, optFilter, accessLevel.EVENT[0].R.level);

        let waitingForApprovalCount = await eventController.countWatingForApproval(admin._id, optFilter, accessLevel.EVENT[0].R.level);

        let totalCostIncome = await transactionController.getTotalCostIncome(admin, accessLevel.EVENT[0].R.level);


        return {
            totalEventsCount,
            waitingForApprovalCount,
            totalCostIncome
        };
    } catch (err) {
        console.error('getStat Failed', err);
        throw err;
    }

};


module.exports = new dashboardController();
