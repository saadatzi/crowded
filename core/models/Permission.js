const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    title: {type: String, unique: true, required: [true, "can't be blank"]},
    access: {type: Number, default: 0}
});

// 11..toString(2)
// schema.set('toJSON', {
//     transform: function (doc, ret, options) {
//         ret.id = ret._id;
//         delete ret._id;
//         delete ret.__v;
//     }
// });
/**
 * Pre-remove hook
 */

PermissionSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
PermissionSchema.method({
    //ToDo method need... this.model('Interest')
    toJSON() {
        return {
            id: this._id,
            title: this.title,
            access: {create: true, read: true, update: false, delete: false}
        }
    }
});

/**
 * Statics
 */
PermissionSchema.static({

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
     * Permission list
     */
    list: async function() {
        return await this.find({})
            .then(permissions => permissions)
            .catch(err => console.log("permissions getAll Catch", err));
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

const Permission = mongoose.model('Permission', PermissionSchema);
module.exports = Permission;