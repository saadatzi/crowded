const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    name: {type: String, index: true, lowercase: true, unique: true, required: [true, "can't be blank"]},
    agent: [{type: Schema.ObjectId, ref: 'Agent'}],
    status: {type: Number, default: 1},
    createdAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now}
});

/**
 * Pre-remove hook
 */

OrganizationSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
OrganizationSchema.method({
    //ToDo method need... this.model('Interest')
});

/**
 * Statics
 */
OrganizationSchema.static({

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

const Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;