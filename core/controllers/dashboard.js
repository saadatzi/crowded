/**
 * Module dependencies.
 */
const moment = require('moment-timezone');
const eventController = require('./event');
const transactionController = require('./transaction');

const dashboardController = function () {
};

/**
 * Login User Panel
 *
 */
dashboardController.prototype.getStats = async (admin, optFilter, accessLevel) => {
    const epoch = Date.now() / 1000;
    let from = moment.unix(epoch).startOf('month').toDate(),
        to = moment.unix(epoch).endOf('month').toDate();

    if (optFilter.allTime) {
        from = null;
        to = null;
    } else if (optFilter.today) {
        from = moment.unix(epoch).startOf('day').toDate();
        to = moment.unix(epoch).endOf('day').toDate();
    } else if (optFilter.month) {
        from = moment.unix(optFilter.month.date).startOf('month').toDate();
        to = moment.unix(optFilter.month.date).endOf('month').toDate();
    } else if (optFilter.year) {
        from = moment.unix(optFilter.year.date).startOf('year').toDate();
        to = moment.unix(optFilter.year.date).endOf('year').toDate();
    }

    try {
        
        let availableYears = await eventController.getAvailableYears(admin._id, accessLevel.EVENT[0].R.level);

        let totalEventsCount = await eventController.countTotal(admin._id, accessLevel.EVENT[0].R.level, from, to);

        let waitingForApprovalCount = await eventController.countWatingForApproval(admin._id, accessLevel.EVENT[0].R.level);

        let upcomingEvents = await eventController.listUpcomingEvents(admin._id, accessLevel.EVENT[0].R.level);

        let totalCostIncome = await transactionController.getTotalCostIncome(admin, accessLevel.EVENT[0].R.level, from, to);

        let panelChart = await transactionController.getPanelChart(admin, accessLevel.EVENT[0].R.level, optFilter);


        return {
            availableYears,
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
dashboardController.prototype.getCalendar = async (admin, monthFlag, accessLevel) => {

    // TODO: use a single aggregation for this
    // By: Kazem
    // 💩⏱️
    // I had to, I'll fix it ASAP

    try {

        let events = await eventController.calendar(admin, monthFlag, accessLevel.EVENT[0].R.level);
        let transactions = await transactionController.calendar(admin, monthFlag, accessLevel.EVENT[0].R.level);


        let eventsLen = events.length;
        let transactionsLen = transactions.length;



        let calendar = [];

        for (let i = 0; i < transactionsLen; i++) {
            let day = transactions[i].day;
            calendar[day] = transactions[i];
        }

        for (let i = 0; i < eventsLen; i++) {
            let day = events[i].day;
            if (calendar[day]) {
                calendar[day].eventCount = events[i].eventCount;
            } else {
                calendar[day] = events[i];
            }
        }

        calendar = calendar.filter(i=>!!i);

        return calendar;
    } catch (err) {
        console.error('getCalendar Failed', err);
        throw err;
    }

};


module.exports = new dashboardController();
