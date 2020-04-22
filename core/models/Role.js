const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name: {type: String, unique: true, lowercase: true, required: [true, "can't be blank"]},
    weight: {type: Number, default: 0},
    status: {type: Number, default: 1},
    permissions: [
        {
            name: {type: String, unique: true, default: 'all',lowercase: true, required: [true, "can't be blank"]},// Collection name / Model or ToDo routing
            permission: {type: String, enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'ALL'], default: 'READ'},
            isRout: {type: Boolean, default: false},
        }
    ]
}, {timestamps: true});

/**
 * Pre-remove hook
 */

RoleSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
RoleSchema.method({
    //ToDo method need... this.model('Interest')
});

/**
 * Statics
 */
RoleSchema.static({

    /**
     * Find User by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(device => device)
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
            .exec(function (err, res) {
                if (err) return {}; //ToDo logger
                console.log(res);
                return res;
            });
    }
});

const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;