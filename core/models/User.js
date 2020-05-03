const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');

const UserSchema = new Schema({
    email: {type: String, index: true, lowercase: true, unique: true, required: [true, "can't be blank"]},
    interests: [{type: Schema.Types.ObjectId, ref: 'Interest'}],
    firstname: String,
    lastname: String,
    image: String,
    sex: Number,
    birthDate: Date,
    phone: String,
    nationality: String,
    salt: String,
    password: String,
    civilId: String,
    status: {type: Number, default: 1},
    lastIp: String,
    lastLogin: Date,
    lastInteract: Date,
}, {timestamps: true});

/**
 * Pre-remove hook
 */

UserSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
UserSchema.method({
    toJSON() {
        return {
            id: this._id,
            email: this.email,
            firstname: this.firstname,
            lastname: this.lastname,
            image: {url: settings.media_domain + this.image},
            sex: this.sex,
            birthDate: this.birthDate,
            phone: this.phone,
            nationality: this.nationality,
            civilId: this.civilId,
        }
    }
});

/**
 * Statics
 */
UserSchema.static({

    /**
     * Find User by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    async getById(_id) {
        return await this.findById({_id})
            .then(user => user)
            .catch(err => console.log("!!!!!!!!User getById catch err: ", err))
    },

    /**
     * Find User by id
     *
     * @param {ObjectId} id
     * @api private
     */
    async getByIdInterest(id) {
        return await this.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(id)}},
            {$project: {interests: 1}}
        ])
            .then(user => user[0])
            .catch(err => console.log("!!!!!!!!User getById catch err: ", err))
    },

    /**
     * Find use by email
     *
     * @param {String} email
     * @api private
     */
    getByEmail: async (email) => {
        return await User.findOne({email: email})
            .then(user => user)
            .catch(err => console.log("!!!!!!!! getByEmail catch err: ", err));
    },

    /**
     * List all User
     *
     * @param {Object} options
     * @api private
     */

    getAll: (options) => {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 50;
        return this.find(criteria)
            .sort({createdAt: -1})
            .limit(limit)
            .skip(limit * page)
            .catch(err => console.error("!!!!!!!!organization getAll catch err: ", err))
    },

    /**
     * List all User in Event
     *
     * @param {Object} optFilter
     * @api private
     */
    //TODO add pagination & filter
    async getAllInEvent(optFilter) {

        const criteria = {status: {$in: [0, 1]}};
        // TODO: enable search
        optFilter.search = optFilter.search || "";
        optFilter.filters = optFilter.filters || {};
        optFilter.sorts = (Object.keys(optFilter.sorts).length === 0 && optFilter.sorts.constructor === Object) ? {updatedAt: -1} : optFilter.sorts;
        optFilter.pagination = optFilter.pagination || {
            page: 0,
            limit: 12
        };

        return await this.aggregate([
            {$match: criteria},
            {
                $lookup: {
                    from: 'userevents',
                    let: {primaryUserId: "$_id"},
                    pipeline: [
                        {$match: {eventId: mongoose.Types.ObjectId(optFilter.eventId)}},
                        {$match: {$expr: {$eq: ["$$primaryUserId", "$userId"]}}},
                        {$project: {_id: 0, status: "$status"}},
                    ],
                    as: 'getUserEvents'
                }
            },
            {$unwind: {path: "$getUserEvents", preserveNullAndEmptyArrays: false}},
            // { $match: { $text: { $search: optFilter.search } } },
            {$match: optFilter.filters},
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $project: {
                    _id: 0,
                    id: "$_id",
                    firstname: 1,
                    lastname: 1,
                    image: {url: {$concat: [settings.media_domain, "$image"]}},
                    sex: 1,
                    nationality: 1,
                    status: '$getUserEvents.status'
                }
            },
        ])
            // .exec()
            .then(users => {
                console.log(">>>>>>>>>>> getAllInEvent events: ", users);
                return users
            })
            .catch(err => console.error("getAllInEvent  Catch", err));
    },


    /**
     * Checks to see if given interest is related to any user
     *
     * @param {String} id
     * @api private
     */
    interestIsRelated: async function (id) {
        let result = await this.aggregate([
            {$match: {interests: mongoose.Types.ObjectId(id)}}
        ])
            .catch(err => {
                console.error(`User interestIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
        return result.length != 0;

    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;