const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');
const moment = require('moment-timezone');
const areaController = require('../controllers/area');
// mongoose.Types.ObjectId.isValid()
const EventSchema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'Admin'},
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
    allowedRadius: {type: Number, default: 0},
    status: {type: Number, default: 0}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
    //TODO why comment allowedApplyTime???!!
    allowedApplyTime: Date,
    orgId: {type: Schema.Types.ObjectId, ref: 'Organization'},
}, {timestamps: true});

//index for geo location
EventSchema.index({location: '2dsphere'});


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
    if (!event.isNew && !event.images[event.images.length - 1].order) {
        const maxOrder = Math.max.apply(Math, event.images.map(function (o) {
            return o.order
        }))
        event.images[event.images.length - 1].order = maxOrder + 1;
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

    /*********************************************/
    /*           FOR DASHBOARD START             */
    /*********************************************/
    countTotal(optFilter) {
        return optFilter;
    },


    /*********************************************/
    /*            FOR DASHBOARD END              */
    /*********************************************/














    /**
     * Find event by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(event => event)
            .catch(err => console.error("!!!!!!!! Event getById catch err: ", err))
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
        console.error("!!!!!!!! getEvent criteria: ", criteria);
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
                    allowedRadius: {$first: `$allowedRadius`},
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
                    allowedRadius: isApproved ? 1 : null
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

        const geoNear = options.lat ? {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [options.lat, options.lng]
                },
                distanceField: "distance",
                maxDistance: 3000000,
                // spherical: true
            }
        } : {$addFields: {empty: ''}};

        const sortValue = !options.lat ? {$sort: {value: -1}} : {$addFields: {empty: ''}};


        return await this.aggregate([
            geoNear,
            {$match: criteria},
            //get Area name
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
            {$unwind: "$images"},
            {$sort: {'images.order': 1}},
            {
                $group: {
                    _id: "$_id",
                    image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}}, //$push
                    title: {$first: `$title_${options.lang}`},
                    // dec: {$first: `$desc_${options.lang}`},
                    value: {$first: "$value"},
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
            sortValue,
            {$skip: limit * page},
            {$limit: limit + 1},
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    image: 1,
                    // dec: 1,
                    area: {$arrayElemAt: ['$getArea', 0]},
                    value: {$toString: "$value"},
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
            .then(events => events)
            .catch(err => console.error("getAllMyEvent  Catch", err));
    },

    /**
     * Event list OWN/Any
     */
    async listOwnAny(userId, optFilter, accessLevel) {

        const ownAny = accessLevel === 'OWN' ? {owner: mongoose.Types.ObjectId(userId), status: {$in: [0, 1]}} : {status: {$in: [0, 1]}};

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                $or: [
                    {
                        title_en: {$regex: regex, $options: "i"}
                    },
                    {
                        title_ar: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_en: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_ar: {$regex: regex, $options: "i"}
                    }
                ]
            };
        }

        console.warn(">>>>>>>>>>>>> listOwnAny optFilter: ", optFilter);
        return await this.aggregate([
            {$match: ownAny},
            {$match: regexMatch},
            {$match: optFilter.filters},
            {$unwind: "$images"},
            {$sort: {'images.order': 1}},
            {
                $group: {
                    _id: "$_id",
                    image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}},
                    title_en: {$first: `$title_en`},
                    status: {$first: `$status`},
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title_en: 1,
                    image: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                },
            },
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            {
                $lookup: {
                    from: 'events',
                    pipeline: [
                        {$match: ownAny},
                        {$match: regexMatch},
                        {$match: optFilter.filters},
                        {$count: 'total'},
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: {$arrayElemAt: ["$getTotal", 0]},
                }
            },
        ])
            .then(result => {
                let items = [],
                    total = 0;
                if (result.length > 0) {
                    total = result[0].total.total;
                    delete result[0].total;
                    items = result[0].items;
                }
                optFilter.pagination.total = total;
                return {explain: optFilter, items};
            })
            .catch(err => console.error(err));
    },

    /**
     * Event list Group
     */
    async listGroup(userId, optFilter) {
        const baseCriteria = {status: {$in: [0, 1]}};

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        title_en: {$regex: regex, $options: "i"}
                    },
                    {
                        title_ar: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_en: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_ar: {$regex: regex, $options: "i"}
                    }
                ]
            };
        }


        return await this.aggregate([
            {$match: baseCriteria},
            {$match: regexMatch},
            {$match: optFilter.filters},
            {
                $lookup: {
                    from: 'admins',
                    pipeline: [
                        {$match: {_id: mongoose.Types.ObjectId(userId)}},
                    ],
                    as: 'getAdmin'
                }
            },
            {$unwind: "$getAdmin"},
            {
                $lookup: {
                    from: 'admins',
                    let: {orgId: "$getAdmin.organizationId", owner: "$owner"},
                    pipeline: [

                        {$match: {$expr: {$eq: ["$$orgId", "$organizationId"]}}},
                        {$match: {$expr: {$eq: ["$$owner", "$_id"]}}},
                        // {$project: {_id: 0, status: "$status"}},
                    ],
                    as: 'getOrgAdmin'
                }
            },
            {$unwind: {path: "$getOrgAdmin", preserveNullAndEmptyArrays: false}},
            {$unwind: {path: "$images", preserveNullAndEmptyArrays: true}},
            {$sort: {'images.order': 1}},
            {
                $group: {
                    _id: "$_id",
                    image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}},
                    title_en: {$first: `$title_en`},
                    status: {$first: `$status`},
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title_en: 1,
                    image: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}}
                },
            },
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            //TODO check valid Count!
            {
                $lookup: {
                    from: 'events',
                    pipeline: [
                        {$match: baseCriteria},
                        {$match: regexMatch},
                        {$match: optFilter.filters},
                        {$count: 'total'},
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: {$arrayElemAt: ["$getTotal", 0]},
                }
            },

        ])
            .then(result => {
                // return result;
                let items = [],
                    total = 0;
                if (result.length > 0) {
                    total = result[0].total.total;
                    delete result[0].total;
                    items = result[0].items;
                }
                optFilter.pagination.total = total;
                return {explain: optFilter, items};
            })
            .catch(err => console.error(err));
    },

    /**
     * List all event
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
            // .sort({createdAt: -1})
            .sort({'images.order': 1})
            .populate('interests')
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(events => events)
            .catch(err => console.error("Event getAll Catch", err));
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
            .catch(err => console.error("Interest getAll Catch", err));
    },

    /**
     * Check Valid Active Event
     */
    async validActiveEvent(id) {
        return await this.findOne({_id: id, from: {$lte: new Date()}, to: {$gt: new Date()}})
            .then(events => events)
            .catch(err => console.error("Interest getAll Catch", err));
    },

    /**
     *
     * @param {String} options
     */
    async getOnePanel(options) {
        if (!options) throw {message: "Missing criteria for Event.getOnePanel!"};
        const baseCriteria = {status: {$in: [0, 1]}, _id: mongoose.Types.ObjectId(options._id)};
        return await this.aggregate([
            {$match: baseCriteria},
            //get Area & clean
            {
                $lookup: {
                    from: 'areas',
                    let: {'primaryArea': '$area'},
                    pipeline: [
                        {$match: {$expr: {$in: ["$$primaryArea", "$childs._id"]}}},
                        {
                            $project: {
                                _id: 0, id: '$_id', name_en: 1, name_ar: 1,
                                childs: {
                                    $map: {
                                        input: "$childs",
                                        as: "child",
                                        in: {
                                            _id: 0,
                                            id: '$$child._id',
                                            name_en: '$$child.name_en',
                                            name_ar: '$$child.name_ar'
                                        }
                                    }
                                }
                            }
                        },
                        {$unwind: "$childs"},
                        {$match: {$expr: {$eq: ["$childs.id", "$$primaryArea"]}}},
                    ],
                    as: 'getArea'
                }
            },
            //get Owner
            {
                $lookup: {
                    from: "admins",
                    localField: "owner",
                    foreignField: "_id",
                    as: "_owner"
                }
            },
            {$unwind: {path: "$images", preserveNullAndEmptyArrays: true}},
            {$sort: {'images.order': 1}},
            {
                $group: {
                    _id: "$_id",
                    isActive: {$first: "$status"},
                    images: {$push: {id: '$images._id',url: {$concat: [settings.media_domain, "$images.url"]}, order: "$images.order"}}, //$push
                    title_en: {$first: `$title_en`},
                    title_ar: {$first: `$title_ar`},
                    desc_en: {$first: `$desc_en`},
                    desc_ar: {$first: `$desc_ar`},
                    value: {$first: {$toString: "$value"}},
                    attendance: {$first: `$attendance`},
                    from: {$first: `$from`},
                    to: {$first: `$to`},
                    area: {$first: `$getArea`},
                    getArea_en: {$first: `$getArea.childs.name_en`},
                    getArea_ar: {$first: `$getArea.childs.name_ar`},
                    _address_en: {$first: `$address_en`},
                    _address_ar: {$first: `$address_ar`},
                    _allowedApplyTime: {$first: `$allowedApplyTime`},
                    coordinates: {$first: `$location.coordinates`},
                    createdAt: {$first: `$createdAt`},
                    updatedAt: {$first: `$updatedAt`},
                    interests: {$first: "$interests"},
                    allowedRadius: {$first: "$allowedRadius"},
                    owner: {$first: {$arrayElemAt: ["$_owner", 0]}}
                }
            },
            //TODO kazem clean interests show only title(_en), image(correct link), id
            //get Interest list & clean
            {
                $lookup:
                    {
                        from: "interests",
                        localField: "interests",
                        foreignField: "_id",
                        as: "interests",
                    }
            },
            {
                $project: {
                    createdAt: 1,
                    updatedAt: 1,
                    owner: "$owner.name",
                    isActive: {$cond: {if: {$eq: ["$isActive", 1]}, then: true, else: false}},
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    images: 1,
                    desc_en: 1,
                    desc_ar: 1,
                    title_en: 1,
                    title_ar: 1,
                    area: {$arrayElemAt: ['$area', 0]},
                    value: 1,
                    attendance: 1,
                    allowedApplyTime: "$_allowedApplyTime",
                    from: 1,
                    to: 1,
                    address_en: {$concat: [{$arrayElemAt: ['$getArea_en', 0]}, ', ', "$_address_en"]},
                    address_ar: {$concat: [{$arrayElemAt: ['$getArea_ar', 0]}, '، ', "$_address_ar"]},
                    lat: {$arrayElemAt: ["$coordinates", 0]},
                    lng: {$arrayElemAt: ["$coordinates", 1]},
                    // __interests: 1 ,
                    // rawInterests: "$interests",
                    interests: 1,
                    allowedRadius: 1
                }
            },
        ])
            // .exec()
            .then(event => event[0])
            .catch(err => console.error(err));

    },

    /**
     * Checks to see if given admin is related to any event
     *
     * @param {String} id
     * @api private
     */
    adminIsRelated: async function (id) {
        let result = await this.aggregate([
            {$match: {owner: mongoose.Types.ObjectId(id)}}
        ])
            .catch(err => {
                console.error(`Event adminIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
        return result.length != 0;
    },

    /**
     *
     * @param {String} id - id of the record
     * @param {Number} newStatus - new status you want to set
     * @param {Number} validateCurrent - a function returning a boolean checking old status
     */
    async setStatus(id, newStatus, validateCurrent = function (old) {
        return true
    }) {
        let record = await this.findOne({_id: id}).catch(err => console.error(err));
        let currentState = record.status;
        if (!validateCurrent(currentState)) throw {message: "Changing status not permitted!"};
        record.status = newStatus;
        return record.save();
    },

    /**
     * List Customer Event
     *
     * @param {ObjectId} userId
     * @param {Object} optFilter
     */
    getAllCustomerEvent: async function (userId, optFilter,) {
        const baseCriteria = {status: {$in: [0, 1]}};

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        title_en: {$regex: regex, $options: "i"}
                    },
                    {
                        title_ar: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_en: {$regex: regex, $options: "i"}
                    },
                    {
                        desc_ar: {$regex: regex, $options: "i"}
                    }
                ]
            };
        }

        return await this.aggregate([
            {$match: baseCriteria},
            {$match: regexMatch},
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
            {$unwind: "$images"},
            {$sort: {'images.order': 1}},
            {
                $group: {
                    _id: "$_id",
                    image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}}, //$push
                    title_en: {$first: `$title_en`},
                    value: {$first: {$toString: "$value"}},
                    attendance: {$first: `$attendance`},
                    from: {$first: `$from`},
                    to: {$first: `$to`},
                    userEventStatus: {$first: `$getUserEvents.status`}
                }
            },
            {$match: optFilter.filters},
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            {
                $lookup: {
                    from: 'events',
                    pipeline: [
                        {$match: baseCriteria},
                        {$match: regexMatch},
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
                        {$match: optFilter.filters},
                        {$count: 'total'},
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: {$arrayElemAt: ["$getTotal", 0]},
                }
            }
        ])
            .then(result => {
                let items = [],
                    total = 0;
                if (result.length > 0) {
                    total = result[0].total.total;
                    delete result[0].total;
                    items = result[0].items;
                }
                optFilter.pagination.total = total;
                return {explain: optFilter, items};
            })
            .catch(err => console.error("getAllCustomerEvent  Catch", err));
    },

});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;