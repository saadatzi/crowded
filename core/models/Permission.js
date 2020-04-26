const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    title: {type: String, index: true, uppercase: true, unique: true, required: [true, "can't be blank"]},
    access: {type: Number, default: 0}
});


/**
 * Pre-remove hook
 */

PermissionSchema.pre('remove', function (next) {
    next();
});

/**
 * Pre-save hook
 */
PermissionSchema.pre('save', function (next) {
    var permission = this;
    console.log(">>>>>>>>>>>>>> toJson this permission: ", permission);

    if (permission.isNew && permission.access < 16) {
        permission.access = (Number(permission.access) + 32);
        console.log(">>>>>>>>>>>>>> toJson  permission is new and: ", permission.access);
    }
    next();
});


/**
 * Methods
 */
PermissionSchema.method({
    toJSON() {
        const arrayAccess = Array.from(String((this.access ? this.access : 0).toString(2)), Number);
        return {
            id: this._id,
            title: this.title,
            access: {create: !!arrayAccess[1], read: !!arrayAccess[2], update: !!arrayAccess[3], delete: !!arrayAccess[4]}
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
                if (err) return {}; //TODO logger
                console.log(res);
                return res;
            });
    }
});

const Permission = mongoose.model('Permission', PermissionSchema);
module.exports = Permission;