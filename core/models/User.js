const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');

const UserSchema = new Schema({
    email: {type: String, index: true, lowercase: true, unique: true, required: [true, "can't be blank"]},
    interests:  [{type: Schema.Types.ObjectId, ref: 'Interest'}],
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
            image: {url: settings.media_domain+this.image},
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
            .then(user =>  user)
            .catch(err => console.log("!!!!!!!!User getById catch err: ", err))},

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
            .exec(function (err, res) {
                if (err) return {}; //TODO logger
                console.log(res);
                return res;
            });
    },


    /**
     * Checks to see if given interest is related to any user
     *
     * @param {String} id
     * @api private
     */
    interestIsRelated: async function (id) {
        let result = this.aggregate([
            { $match: {interests:id} }
        ])
        .catch(err => {
            console.error(`User interestIsRelated check failed with criteria id:${id}`, err);
            throw err;
        });
        console.log(result.length==0);
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;