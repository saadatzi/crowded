const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {type: String, index: true},
    firstName: String,
    lastName: String,
    sex: Number,
    birthDate: Date,
    phone: String,
    nationality: String,
    password: String,
    IBAN: String,
    civilId: String,
    profilePicture: String,
    status: Number,
    lastIp: String,
    lastLogin: Date,
    lastInteract: Date,
    createdAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now }
});

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
     * Find User
     *
     * @param {ObjectId} _id
     * @api private
     */
    get: (_id) => this.findById({_id}).exec(),

    /**
     * Find use by email
     *
     * @param {String} email
     * @api private
     */
    getByEmail: async (email) => {

        return await User.findOne({email: email})
            .then(device => {
                console.log("########## getByIdentifier device: ", device)
                return device
            })
            .catch(err => console.log("!!!!!!!! getByIdentifier catch err: ", err));
        // console.log("########## getByIdentifier device: ", device)
        // if (err) {
        // }
        // return (device)
        // });
        /*return new Promise(resolve => {
            this.findOne({identifier: identifier}, (err, device) => {
                if (err) {}
                resolve(device)
            })
        });*/
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