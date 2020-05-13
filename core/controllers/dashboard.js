/**
 * Module dependencies.
 */

let Admin = require('../models/Admin');
let Event = require('../models/Event');
let Transaction = require('../models/Transaction');


const dashboardController = function () {
};

/**
 * Login User Panel
 *
 */
dashboardController.prototype.getStats = async (optFilter) => {

    try {

        let totalEventsCount = Event.countTotal(optFilter);



        return {
            totalEventsCount
        };
    } catch (err) {
        console.error('getStat Failed', err);
        throw err;
    }

};



module.exports = new dashboardController();
