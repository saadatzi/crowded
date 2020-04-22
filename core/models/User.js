const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    IBAN: String,
    civilId: String,
    profilePicture: String,
    status: {type: Number, default: 1},
    lastIp: String,
    lastLogin: Date,
    lastInteract: Date,
}, {timestamps: true});

/**
 * Pre-remove hook
 */

UserSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
UserSchema.method({
    //ToDo method need... this.model('Interest')
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
    getById: function(_id) {
        return this.findById({_id})
            .then(device =>  device)
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
                if (err) return {}; //ToDo logger
                console.log(res);
                return res;
            });
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;