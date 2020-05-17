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

        let upcomingEvents = await eventController.listUpcomingEvents(admin._id, optFilter, accessLevel.EVENT[0].R.level);

        let totalCostIncome = await transactionController.getTotalCostIncome(admin, accessLevel.EVENT[0].R.level);

        let panelChart = await transactionController.getPanelChart(admin, accessLevel.EVENT[0].R.level);


        return {
            totalEventsCount,
            waitingForApprovalCount,
            upcomingEvents,
            totalCostIncome,
            panelChart
        };
    } catch (err) {
        console.error('getStat Failed', err);
        throw err;
    }

};


/**
 * Login User Panel
 *
 */
dashboardController.prototype.getCalendar = async (userId,monthFlag,accessLevel) => {

    try {

        let calendar = await eventController.calendar(userId, monthFlag, accessLevel.EVENT[0].R.level);

        return calendar
    } catch (err) {
        console.error('getCalendar Failed', err);
        throw err;
    }

};



module.exports = new dashboardController();
