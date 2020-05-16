/**
 * Module dependencies.
 */

const eventController = require('./event');

const dashboardController = function () {
};

/**
 * Login User Panel
 *
 */
dashboardController.prototype.getStats = async (userId,optFilter,accessLevel) => {

    try {

        let totalEventsCount = await eventController.countTotal(userId, optFilter, accessLevel.EVENT[0].R.level);

        let waitingForApprovalCount = await eventController.countWatingForApproval(userId, optFilter, accessLevel.EVENT[0].R.level);

        let upcomingEvents = await eventController.listUpcomingEvents(userId, optFilter, accessLevel.EVENT[0].R.level);

        let totalEarned = await eventController.countWatingForApproval(userId, optFilter, accessLevel.EVENT[0].R.level);


        return {
            totalEventsCount,
            waitingForApprovalCount,
            upcomingEvents
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
