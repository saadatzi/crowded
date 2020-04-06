const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'Interest'},
    deviceId:  {type: Schema.Types.ObjectId, ref: 'Interest'},
    interestId:  {type: Schema.Types.ObjectId, ref: 'Interest'},
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now}
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