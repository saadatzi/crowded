const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');
const moment = require('moment-timezone');
const areaController = require('../controllers/area');
// mongoose.Types.ObjectId.isValid()
const EventSchema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'Agent'},
    title_ar: String,
    title_en: String,
    desc_ar: String,
    desc_en: String,
    images: [{
        url: String,
        order: {type: Number, default: 1},
    }],
    interests: [{type: Schema.Types.ObjectId, ref: 'Interest'}],
    value: {type: Schema.Types.Decimal128, default: 0},
    attendance: {type: Number, default: 0}, //Minute
    from: Date,
    to: Date,
    area: {type: Schema.Types.ObjectId, ref: 'Area', required: true},
    address_ar: String,
    address_en: String,
    location: {
        type: {type: String, enum: ['Point', 'LineString', 'Polygon' /*& multi*/], default: 'Point'},
        coordinates: {type: [Number], default: [0, 0]}
    },
    status: {type: Number, default: 0}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
    allowedApplyTime: Date
}, {timestamps: true});

//index for geo location
EventSchema.index({location: '2dsphere'});

// index for search
EventSchema.index({ title_en: 'text' });


/*
//get enum value
console.log(use.schema.path('salutation').enumValues);



* Restaurants.aggregate([
   {
     $geoNear: {
        near: {
          type: "Point",
          coordinates: [ long , lat]
        },
        distanceField: "dist.calculated",
        maxDistance: 2,
        spherical: true
     }
   }
  ],(err,data)=>{
   if(err) {
     next(err);
     return;
   }
   res.send(data);
 })
});
*
*
* Message.find({
  location: {
   $near: {
    $maxDistance: 1000,
    $geometry: {
     type: "Point",
     coordinates: [long, latt]
    }
   }
  }
 }).find((error, results) => {
  if (error) console.log(error);
  console.log(JSON.stringify(results, 0, 2));
 });
* */

/**
 * Pre-remove hook
 *

 */
EventSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Pre-save hook
 */
EventSchema.pre('save', function (next) {
    var event = this;
    if (!event.isNew && !event.images[event.images.length-1].order) {
        console.log(">>>>>>>>>>>>>> pre save AddImage event: ", event);
        const maxOrder = Math.max.apply(Math, event.images.map(function(o) {return o.order}))
        event.images[event.images.length-1].order = maxOrder + 1;
    }
    next();
});

/**
 * Methods
 */
EventSchema.method({
    detailDto: async function (lang) {
        const area = await areaController.get(this.area);
        return {
            id: this._id,
            title: this[`title_${lang}`],
            desc: this[`desc_${lang}`],
            value: this.value.toString(),
            attendance: this.attendance,
            date: {
                day: {$dayOfMonth: {date: "$from", timezone: "Asia/Kuwait"}},
                month: {
                    $arrayElemAt: [settings.constant.monthNamesShort, {
                        $month: {
                            date: "$from",
                            timezone: "Asia/Kuwait"
                        }
                    }]
                },
                from: {$dateToString: {date: `$from`, timezone: "Asia/Kuwait", format: "%H:%M"}},
                to: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M"}}
            },
            area: area,
            address: this[`address_${lang}`],
        }
    }
});

/**
 * Statics
 */
EventSchema.static({
    /**
     * Find event by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(event => event)
            .catch(err => console.log("!!!!!!!! Event getById catch err: ", err))
    },


    /**
     * Event Detail
     *
     * @param {ObjectId} id
     * @param {String} lang
     * @param {Boolean} isApproved
     * @param {String} userEventState
     * @api private
     */
    getByIdAggregate: async function (id, lang, isApproved, userEventState = null) {
        const criteria = {_id: mongoose.Types.ObjectId(id)};
        console.log("!!!!!!!! getEvent criteria: ", criteria);
        return await this.aggregate([
            // {$lookup: {from: 'areas', localField: 'area', foreignField: `childs._id`, as: 'getArea'}}, //from: collection Name  of mongoDB
            {
                $lookup: {
                    from: 'areas',
                    let: {'primaryArea': '$area'},
                    pipeline: [
                        {$match: {$expr: {$in: ["$$primaryArea", "$childs._id"]}}},
                        {$unwind: "$childs"},
                        {$match: {$expr: {$eq: ["$childs._id", "$$primaryArea"]}}}
                    ],
                    as: 'getArea'
                }
            },
            {$match: criteria},
            {$unwind: "$images"},
            {$sort: {'images.order': 1}},
            // {$replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$area", 0 ] }, "$$ROOT" ] } }},
            {
                $group: {
                    _id: "$_id",
                    images: {$push: {url: {$concat: [settings.media_domain, "$images.url"]}}}, //$push
                    title: {$first: `$title_${lang}`},
                    desc: {$first: `$desc_${lang}`},
                    value: {$first: {$toString: "$value"}},
                    attendance: {$first: `$attendance`},
                    from: {$first: `$from`},
                    to: {$first: `$to`},
                    getArea: {$first: `$getArea.childs.name_${lang}`}, //
                    _address: {$first: `$address_${lang}`},
                    coordinates: {$first: `$location.coordinates`},

                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    images: 1,
                    desc: 1,
                    // area: {$arrayElemAt: ['$getArea', 0]},
                    value: 1,
                    attendance: 1,
                    status: userEventState,
                    date: {
                        day: {
                            $concat: [
                                {
                                    $arrayElemAt: [settings.constant.dayOfWeek, {
                                        $dayOfWeek: {
                                            date: "$from",
                                            timezone: "Asia/Kuwait"
                                        }
                                    }]
                                }, ' ', {$toString: {$dayOfMonth: {date: "$from", timezone: "Asia/Kuwait"}}}
                            ]
                        },
                        month: {
                            $arrayElemAt: [settings.constant.monthNames, {
                                $month: {
                                    date: "$from",
                                    timezone: "Asia/Kuwait"
                                }
                            }]
                        },
                        from: {$dateToString: {date: `$from`, timezone: "Asia/Kuwait", format: "%H:%M"}},
                        to: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M"}}
                    },
                    address: isApproved ? {$concat: [{$arrayElemAt: ['$getArea', 0]}, ', ', "$_address"]} : {$arrayElemAt: ['$getArea', 0]},
                    coordinates: isApproved ? 1 : null,
                }
            },
        ])
            // .exec()
            .then(event => event[0])
            .catch(err => console.error("getByIdAggregate(Event Detail)  Catch", err));
    },


    /**
     * List all my Interest Event
     *
     * @param {Object} options
     * @api private
     */
    getAllMyInterestEvent: async function (options) {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = settings.event.limitPage;

        criteria.status = 1;
        criteria.allowedApplyTime = {$gt: new Date()};

        const sortNearDate = options.lat ? {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [options.lat, options.lng]
                },
                distanceField: "distance",
                maxDistance: 3000000,
                spherical: true
            }
        } : {$sort: {value: -1}};


        return await this.aggregate([
            // {$lookup: {from: 'areas', localField: 'area', foreignField: `childs._id`, as: 'getArea'}}, //from: collection Name  of mongoDB
            sortNearDate,
            {$match: criteria},
            {$skip: limit * page},
            {$limit: limit + 1},
            {$unwind: "$images"},
            {$sort: {'images.order': 1}},
            {
                $lookup: {
                    from: 'areas',
                    let: {'primaryArea': '$area'},
                    pipeline: [
                        {$match: {$expr: {$in: ["$$primaryArea", "$childs._id"]}}},
                        {$unwind: "$childs"},
                        {$match: {$expr: {$eq: ["$childs._id", "$$primaryArea"]}}}
                    ],
                    as: 'getArea'
                }
            },
            // {$replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$area", 0 ] }, "$$ROOT" ] } }},
            {
                $group: {
                    _id: "$_id",
                    image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}}, //$push
                    title: {$first: `$title_${options.lang}`},
                    // dec: {$first: `$desc_${options.lang}`},
                    value: {$first: {$toString: "$value"}},
                    // attendance: {$first: `$attendance`},
                    from: {$first: `$from`},
                    to: {$first: `$to`},
                    // createdAt: {$first: `$createdAt`},
                    // allowedApplyTime: {$first: `$allowedApplyTime`},
                    // date: {$first: moment.tz("$from", 'Asia/Kuwait').format('YYYY-MM-DD HH:MM')},
                    // date: {$first: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%m-%d-%Y"}}},
                    getArea: {$first: `$getArea.childs.name_${options.lang}`}, //
                    address: {$first: `$address_${options.lang}`},
                    distance: {$first: "$distance"}

                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    image: 1,
                    // dec: 1,
                    area: {$arrayElemAt: ['$getArea', 0]},
                    value: 1,
                    count: 1,
                    // attendance: 1,
                    //{$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%m-%d"}}
                    date: {
                        day: {$toString: {$dayOfMonth: {date: "$from", timezone: "Asia/Kuwait"}}},
                        month: {
                            $arrayElemAt: [settings.constant.monthNamesShort, {
                                $month: {
                                    date: "$from",
                                    timezone: "Asia/Kuwait"
                                }
                            }]
                        },
                        from: {$dateToString: {date: `$from`, timezone: "Asia/Kuwait", format: "%H:%M"}},
                        to: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M"}}
                        // from: {$concat: [{$toString: {$hour: "$from"}}, ":", {$toString: {$minute: "$from"}}]},
                        // to: {$concat: [{$toString: {$hour: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M"}}}}, ":", {$toString: {$minute: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%m-%d"}}}}]},
                    },
                    // createdAt: 0
                    // date: 1,
                    // from: 1,
                    // to: 1,
                    // address: 1
                }
            },
            // {$sort: {id: -1}},
        ])
            // .exec()
            .then(events => events)
            .catch(err => console.error("getAllMyInterestEvent  Catch", err));
    },


    /**
     * List my Event
     *
     * @param {Object} userId
     * @param {String} lang
     * @param {Date} dateFilter
     * @param {Number} page
     * @param {Boolean} isPrevious
     */
    getAllMyEvent: async function (userId, lang, page, isPrevious, dateFilter) {
        const criteria = {
            status: 1,
            from: isPrevious ? {$lt: new Date()} : {$gte: new Date()} // after now & before now
        };

        if (dateFilter) criteria.from = {$gte: dateFilter.startMonth, $lt: dateFilter.endMonth};

        //TODO .find date range
        /*criteria.from = {
        $expr: {
            $and: [
                {$eq: [{$month: "$dob"}, {$month: dateFilter}]},
                {$eq: [{$year: "$dob"}, {$year: dateFilter}]}
            ]
        }
    };*/

        const limit = settings.event.limitPage;

        console.log(">>>>>>>>>>> getAllMyEvent userId: ", userId);
        console.log(">>>>>>>>>>> getAllMyEvent criteria: ", criteria);
        return await this.aggregate([
            {$match: criteria},
            {
                $lookup: {
                    from: 'userevents',
                    let: {primaryEventId: "$_id"},
                    pipeline: [
                        {$match: {userId: mongoose.Types.ObjectId(userId)}},
                        {$match: {$expr: {$eq: ["$$primaryEventId", "$eventId"]}}},
                        {$project: {_id: 0, status: "$status"}},
                    ],
                    as: 'getUserEvents'
                }
            },
            {$unwind: {path: "$getUserEvents", preserveNullAndEmptyArrays: false}},
            {$sort: {createdAt: -1}},
            {$skip: limit * page},
            {$limit: limit + 1},
            {$unwind: "$images"},
            {$sort: {'images.order': 1}},
            {
                $group: {
                    _id: "$_id",
                    image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}}, //$push
                    title: {$first: `$title_${lang}`},
                    value: {$first: {$toString: "$value"}},
                    attendance: {$first: `$attendance`},
                    from: {$first: `$from`},
                    to: {$first: `$to`},
                    userEventStatus: {$first: `$getUserEvents.status`}
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    image: 1,
                    // dec: 1,
                    value: 1,
                    attendance: 1,
                    date: {
                        day: {$toString: {$dayOfMonth: {date: "$from", timezone: "Asia/Kuwait"}}},
                        month: {
                            $arrayElemAt: [settings.constant.monthNamesShort, {
                                $month: {
                                    date: "$from",
                                    timezone: "Asia/Kuwait"
                                }
                            }]
                        },
                        dayShortName: {
                            $arrayElemAt: [settings.constant.dayOfWeekShort, {
                                $dayOfWeek: {
                                    date: "$from",
                                    timezone: "Asia/Kuwait"
                                }
                            }]
                        },
                        dayMonth: {
                            $concat: [
                                {
                                    $arrayElemAt: [settings.constant.dayOfWeek, {
                                        $dayOfWeek: {
                                            date: "$from",
                                            timezone: "Asia/Kuwait"
                                        }
                                    }]
                                },
                                ' ',
                                {$toString: {$dayOfMonth: {date: "$from", timezone: "Asia/Kuwait"}}},
                                ' ',
                                {
                                    $arrayElemAt: [settings.constant.monthNames, {
                                        $month: {
                                            date: "$from",
                                            timezone: "Asia/Kuwait"
                                        }
                                    }]
                                },
                            ]
                        },
                        from: {$dateToString: {date: `$from`, timezone: "Asia/Kuwait", format: "%H:%M"}},
                        to: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M"}}
                    },
                    // getUserEvents: 1,
                    userEventStatus: 1
                    // _eventIds: 1,
                }
            },
            {$sort: {id: -1}},
        ])
            // .exec()
            .then(events => {
                console.log(">>>>>>>>>>> getAllMyEvent events: ", events);
               return  events
            })
            .catch(err => console.error("getAllMyEvent  Catch", err));
    },

    /**
     * Event list
     */
    async list(optFilter) {

         // TODO: enable search
         optFilter.search = optFilter.search || "";
         optFilter.filters = optFilter.filters || {
             status: 1
         };
         optFilter.sorts = optFilter.sorts || {
             title_en: 1
         };
         optFilter.pagination = optFilter.pagination || {
             page: 0,
             limit: 12
         };
 
         // TODO: do it the right way
         // Absolutely not a rational decision - Kazem
         // Didn't have time to do it the right way - Kazem
         let total = await this.aggregate([
             // { $match: { $text: { $search: optFilter.search } } },
             { $match: optFilter.filters },
             // { $sort: { score: { $meta: "textScore" } } },
             { $count: 'total' },
             { $project: { total: "$total" } }
         ])
             .catch(err => console.error(err));
 
         let items = await this.aggregate([
             // { $match: { $text: { $search: optFilter.search } } },
             { $match: optFilter.filters },
             // { $sort: { score: { $meta: "textScore" } } },
             { $sort: optFilter.sorts },
             { $skip: optFilter.pagination.page * optFilter.pagination.limit },
             { $limit: optFilter.pagination.limit },
             {$unwind: "$images"},
             {$sort: {'images.order': 1}},
             {
                 $group: {
                     _id: "$_id",
                     image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}}, 
                     title_en: {$first: `$title_en`},
                    //  value: {$first: {$toString: "$value"}},    
                 }
             },
             {
                 $project: {
                     _id: 0,
                     id: '$_id',
                     title_en: 1, 
                     image: 1
                 }
             }
         ])
             .catch(err => console.error(err));
 
         optFilter.pagination.total = total[0].total;
 
         return { explain: optFilter, items };
    },

    /**
     * List all event
     *
     * @param {Object} options
     * @api private
     */
    getAll: async function (options) {
        console.log("!!!!!!!! getAll Event options: ", options)
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
        return await this.find(criteria)
            // .sort({createdAt: -1})
            .sort({'images.order': 1})
            .populate('interests')
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(events => events)
            .catch(err => console.log("Event getAll Catch", err));
    },

    /**
     * Checks to see if given interest is related to any event
     *
     * @param {String} id
     * @api private
     */
    interestIsRelated: async function (id) {
        let result = await this.aggregate([
            {$match: {interests: mongoose.Types.ObjectId(id)}}
        ])
            .catch(err => {
                console.error(`Event interestIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
        return result.length != 0;
    },

    /**
     * Check Valid Event(find id, allowedApplyTime)
     */
    async validApplyEvent(id) {
        return await this.findOne({_id: id, allowedApplyTime: {$gt: new Date()}})
            .then(events => events)
            .catch(err => console.log("Interest getAll Catch", err));
    },

    /**
     * Check Valid Active Event
     */
    async validActiveEvent(id) {
        return await this.findOne({_id: id, from: {$lte: new Date()}, to: {$gt: new Date()}})
            .then(events => events)
            .catch(err => console.log("Interest getAll Catch", err));
    },

    /**
     *
     * @param {String} id
     */
    async getOnePanel(options) {
        if (!options) throw { message: "Missing criteria for Event.getOnePanel!" };
        options._id = mongoose.Types.ObjectId(options._id);
        return await this.aggregate([
            {
                $lookup: {
                    from: 'areas',
                    let: { 'primaryArea': '$area' },
                    pipeline: [
                        { $match: { $expr: { $in: ["$$primaryArea", "$childs._id"] } } },
                        { $unwind: "$childs" },
                        { $match: { $expr: { $eq: ["$childs._id", "$$primaryArea"] } } }
                    ],
                    as: 'getArea'
                }
            },
            { $match: options },
            { $unwind: "$images" },
            { $sort: { 'images.order': 1 } },
            {
                $group: {
                    _id: "$_id",
                    images: { $push: { url: { $concat: [settings.media_domain, "$images.url"] } } }, //$push
                    title_en: { $first: `$title_en` },
                    title_ar: { $first: `$title_ar` },
                    desc_en: { $first: `$desc_en` },
                    desc_ar: { $first: `$desc_ar` },
                    value: { $first: { $toString: "$value" } },
                    attendance: { $first: `$attendance` },
                    from: { $first: `$from` },
                    to: { $first: `$to` },
                    getArea_en: { $first: `$getArea.childs.name_en` }, //
                    getArea_ar: { $first: `$getArea.childs.name_ar` }, //
                    _address_en: { $first: `$address_en` },
                    _address_ar: { $first: `$address_ar` },
                    coordinates: { $first: `$location.coordinates` },

                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    images: 1,
                    desc: 1,
                    // area: {$arrayElemAt: ['$getArea', 0]},
                    value: 1,
                    attendance: 1,
                    status: 1,
                    date: {
                        day: {
                            $concat: [
                                {
                                    $arrayElemAt: [settings.constant.dayOfWeek, {
                                        $dayOfWeek: {
                                            date: "$from",
                                            timezone: "Asia/Kuwait"
                                        }
                                    }]
                                }, ' ', { $toString: { $dayOfMonth: { date: "$from", timezone: "Asia/Kuwait" } } }
                            ]
                        },
                        month: {
                            $arrayElemAt: [settings.constant.monthNames, {
                                $month: {
                                    date: "$from",
                                    timezone: "Asia/Kuwait"
                                }
                            }]
                        },
                        from: { $dateToString: { date: `$from`, timezone: "Asia/Kuwait", format: "%H:%M" } },
                        to: { $dateToString: { date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M" } }
                    },
                    address_en: { $concat: [{ $arrayElemAt: ['$getArea_en', 0] }, ', ', "$_address_en"] },
                    address_ar: { $concat: [{ $arrayElemAt: ['$getArea_ar', 0] }, ', ', "$_address_ar"] },
                    coordinates: 1
                }
            },
        ])
            // .exec()
            .then(event => event[0])
            .catch(err => console.error(err));

    }
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;