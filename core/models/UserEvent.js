const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserEventSchema = new Schema({
    status: {
        type: String,
        enum: ['APPLIED', 'APPROVED', 'REJECTED', 'ACTIVE', 'LEFT', 'PAUSED', 'CONTINUE', 'SUCCESS', 'MISSED', 'UNAPPROVED'],
        default: 'APPLIED'
    },
    userId: {type: Schema.ObjectId, ref: 'User'},
    eventId: {type: Schema.ObjectId, ref: 'Event'},
    attendance: [
        {
            elapsed: {type: Number, required: [true, "elapsed can't be blank!"]},
            location: {
                type: {type: String, enum: ['Point'], default: 'Point'},
                coordinates: {type: [Number], default: [0, 0]}
            },
            createAt: {type: Date, default: Date.now},
        }
    ],
    feedbackDesc: String,
    feedbackTitle: String,
    star: Number,
}, {timestamps: true});
UserEventSchema.index({userId: 1, eventId: 1}, {unique: true});


/**
 * Pre-remove hook
 */

UserEventSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
UserEventSchema.method({});

/**
 * Statics
 */
UserEventSchema.static({
    /**
     * Find userEvent by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(userEvent => userEvent)
            .catch(err => console.error("!!!!!!!! Event getById catch err: ", err))
    },


    /**
     * Find userEvent current
     *
     * @param {Object} criteria
     * @api private
     */
    getOne: function (criteria) {
        return this.findOne(criteria)
            .then(userEvent => userEvent)
            .catch(err => console.error("!!!!!!!! Event getCurrent catch err: ", err))
    },


    /**
     * job Final status
     *
     */
    async jobFinalStatus() {
        const criteria = {
            status: {$in: ['APPLIED', 'APPROVED', 'ACTIVE', 'PAUSED', 'CONTINUE']}
        };

        return await this.aggregate([
            {$match: criteria},
            {
                $lookup: {
                    from: 'events',
                    let: {primaryEventId: "$eventId"},
                    pipeline: [
                        {$match: {$expr: {$and: [{$eq: ["$_id", "$$primaryEventId"]}, {$gt: [new Date(), "$to"]}]}}},
                    ],
                    as: 'getEvents'
                }
            },
            {$unwind: {path: "$getEvents", preserveNullAndEmptyArrays: false}},
            {$set: {status: {$cond: {if: {$eq: ["$status", 'APPLIED']}, then: 'UNAPPROVED', else: 'MISSED'}}}},
            {$group: {_id: {status: "$status"}, ids: {$push: '$_id'}}}
        ])
            .then(groupResult => {
                groupResult.map(gr => {
                    UserEvent.updateMany({_id: {$in: gr.ids}}, {status: gr._id.status})
                        .catch(err => console.error("jobFinalStatus updateMany Catch", err));
                });
                return groupResult
            })
    },

    /**
     * job PushNotification Tomorrow Event
     *
     */
    async jobTomorrowEvent(startDay, endDay) {
        const criteria = {status: 'APPROVED'};

        return await this.aggregate([
            {$match: criteria},
            {
                $lookup: {
                    from: 'events',
                    let: {primaryEventId: "$eventId"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$_id", "$$primaryEventId"]},
                                        {$gte: ["$from", startDay]},
                                        {$lte: ["$from", endDay]},
                                    ]
                                }
                            }
                        },
                    ],
                    as: 'getEvents'
                }
            },
            {$unwind: {path: "$getEvents", preserveNullAndEmptyArrays: false}},
            {
                $lookup: {
                    from: 'devices',
                    let: {primaryUserId: "$userId"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$userId", "$$primaryUserId"]}}},
                    ],
                    as: 'getDevice'
                }
            },
            {$unwind: "$getDevice"},
            // {$unwind: {path: "$getDevice", preserveNullAndEmptyArrays: false}},

            // {$set: {status: {$cond: {if: {$eq: ["$status", 'APPLIED']}, then: 'UNAPPROVED', else: 'MISSED'}}}},
            {
                $group: {
                    _id: {eventId: "$getEvents._id"},
                    title: {$first: "$getEvents.title_en"},
                    time: {
                        $first: {
                            $dateToString: {
                                format: "%H:%M",
                                date: "$getEvents.from",
                                timezone: "Asia/Kuwait"
                            }
                        }
                    },
                    notificationIds: {$push: '$getDevice.notificationToken'}
                }
            },
            {$project: {eventId: "$_id.eventId", _id: 0, title: 1, time: 1, notificationIds: 1}},
            {$sort: {eventId: 1}},

        ])
            .then(tomorrowResult => {
                // console.info("~~~~~~~~~~~~~~~~~~ tomorrowResult: ", tomorrowResult);
                return tomorrowResult
            })
    },

    /**
     * List all userEvent
     *
     * @param {Object} options
     * @api private
     */
    getAll: async function (options) {
        console.error("!!!!!!!! getAll Event options: ", options)
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return await this.find(criteria)
            // .sort({createAt: -1})
            .sort({'images.order': 1})
            .populate('interests')
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(userEvents => userEvents)
            .catch(err => console.error("Event getAll Catch", err));
    },

    /**
     * Checks to see if given event is related to any UserEvent
     *
     * @param {String} id
     * @api private
     */
    eventIsRelated: async function (id) {
        let result = await this.aggregate([
            {$match: {eventId: mongoose.Types.ObjectId(id)}}
        ])
            .catch(err => {
                console.error(`UserEvent eventIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
        return result.length != 0;
    },
});

const UserEvent = mongoose.model('UserEvent', UserEventSchema);
module.exports = UserEvent;