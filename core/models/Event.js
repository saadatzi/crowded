const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');
const moment = require('moment-timezone');

const EventSchema = new Schema({
    title_ar: String,
    title_en: String,
    desc_ar: String,
    desc_en: String,
    images: [{
        url: String,
        order: Number
    }],
    interests: [{type: Schema.Types.ObjectId, ref: 'Interest'}],
    value: {type: Schema.Types.Decimal128, default: 0},
    attendance: {type: Number, default: 0},
    from: Date,
    to: Date,
    area: {type: Schema.Types.ObjectId, required: true},
    address_ar: String,
    address_en: String,
    location: {
        type: {type: String, enum: ['Point', 'LineString', 'Polygon' /*& multi*/], default: 'Point'},
        coordinates: {type: [Number], default: [0, 0]}
    },
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
    allowedApplyTime: Date,
    createAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
});

//index for geo location
EventSchema.index({location: '2dsphere'});

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
 */

EventSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
EventSchema.method({
    //ToDo method need... this.model('Animal')
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
     * Find event by identifier
     *
     * @param {String} identifier
     * @api private
     */
    getByIdentifier: (identifier) => {
        return Event.findOne({identifier: identifier})
            .then(event => event)
            .catch(err => console.log("!!!!!!!! getByIdentifier catch err: ", err));
        // console.log("########## getByIdentifier event: ", event)
        // if (err) {
        // }
        // return (event)
        // });
        /*return new Promise(resolve => {
            this.findOne({identifier: identifier}, (err, event) => {
                if (err) {}
                resolve(event)
            })
        });*/
    },


    /**
     * List all my event
     *
     * @param {Object} options
     * @api private
     */
    getAllMyEvents: async function (options) {
        console.log("!!!!!!!! getMyEvents options: ", options)
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = settings.event.limitPage;

        criteria.status = 1;
        criteria.allowedApplyTime = {$gt: new Date()};

        console.log("!!!!!!!! getMyEvents criteria: ", criteria)
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
            // {$unwind: '$getArea'},
            // {$match: {'getArea.childs._id': {$eq: '$area'}}},
            {$limit: limit + 1},
            {$skip: limit * page},
            {$unwind: "$images"},
            {$sort: {createAt: -1, 'images.order': 1}},
            // {$replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$area", 0 ] }, "$$ROOT" ] } }},
            {
                $group: {
                    _id: "$_id",
                    image: {$first: {url: {$concat: [settings.media_domain, "$images.url"]}}}, //$push
                    title: {$first: `$title_${options.lang}`},
                    dec: {$first: `$desc_${options.lang}`},
                    value: {$first: {$toString: "$value"}},
                    attendance: {$first: `$attendance`},
                    from: {$first: `$from`},
                    to: {$first: `$to`},
                    // allowedApplyTime: {$first: `$allowedApplyTime`},
                    // date: {$first: moment.tz("$from", 'Asia/Kuwait').format('YYYY-MM-DD HH:MM')},
                    // date: {$first: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%m-%d-%Y"}}},
                    getArea: {$first: `$getArea.childs.name_${options.lang}`}, //
                    address: {$first: `$address_${options.lang}`},
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    image: 1,
                    dec: 1,
                    area: {$arrayElemAt: ['$getArea', 0]},
                    value: 1,
                    count: 1,
                    // attendance: 1,
                    //{$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%m-%d"}}
                    date: {
                        day: {$dayOfMonth: {date: "$from", timezone: "Asia/Kuwait"}},
                        month: {
                            $let: {
                                vars: {
                                    monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                                },
                                in: {$arrayElemAt: ['$$monthsInString', {$month: {date: "$from", timezone: "Asia/Kuwait"}}]}
                            }
                        },
                        from: {$dateToString: {date: `$from`, timezone: "Asia/Kuwait", format: "%H:%M"}},
                        to: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M"}}
                        // from: {$concat: [{$toString: {$hour: "$from"}}, ":", {$toString: {$minute: "$from"}}]},
                        // to: {$concat: [{$toString: {$hour: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%H:%M"}}}}, ":", {$toString: {$minute: {$dateToString: {date: `$to`, timezone: "Asia/Kuwait", format: "%m-%d"}}}}]},
                    },
                    // date: 1,
                    // from: 1,
                    // to: 1,
                    // address: 1
                }
            },
        ])
            // .exec()
            .then(events => events)
            .catch(err => console.log("getMyEvents  Catch", err));
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
            // .sort({createAt: -1})
            .sort({'images.order': 1})
            .populate('interests')
            .limit(limit)
            .skip(limit * page)
            .exec()
            .then(events => events)
            .catch(err => console.log("Event getAll Catch", err));
    }
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;