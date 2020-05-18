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
    let from = moment.unix(Date.now()).startOf('month').toDate(),
        to = moment.unix(Date.now()).endOf('month').toDate();

    if (optFilter.allTime) {
        from = null;
        to = null;
    } else if (optFilter.today) {
        from = moment.unix(Date.now()).startOf('day').toDate();
        to = moment.unix(Date.now()).endOf('day').toDate();
    } else if (optFilter.month) {
        from = moment.unix(optFilter.month.date).startOf('month').toDate();
        to = moment.unix(optFilter.month.date).endOf('month').toDate();
    } else if (optFilter.year) {
        from = moment.unix(optFilter.year.date).startOf('year').toDate();
        to = moment.unix(optFilter.year.date).endOf('year').toDate();
    }

    try {
        let totalEventsCount = await eventController.countTotal(admin._id, accessLevel.EVENT[0].R.level, from, to);

        let waitingForApprovalCount = await eventController.countWatingForApproval(admin._id, accessLevel.EVENT[0].R.level, from, to);

        let upcomingEvents = await eventController.listUpcomingEvents(admin._id, accessLevel.EVENT[0].R.level, from, to);

        let totalCostIncome = await transactionController.getTotalCostIncome(admin, accessLevel.EVENT[0].R.level, from, to);

        let panelChart = await transactionController.getPanelChart(admin, accessLevel.EVENT[0].R.level, optFilter);


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
dashboardController.prototype.getCalendar = async (userId, monthFlag, accessLevel) => {

    try {

        let eventCount = await eventController.calendarEventCount(userId, monthFlag, accessLevel.EVENT[0].R.level);

        return {
            eventCount
        };
    } catch (err) {
        console.error('getCalendar Failed', err);
        throw err;
    }

};


module.exports = new dashboardController();
