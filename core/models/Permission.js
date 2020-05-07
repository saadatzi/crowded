const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    title: {type: String, index: true, uppercase: true, unique: true, required: [true, "can't be blank"]},
    access: {type: Number, default: 0},
    order: Number
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
        const len = arrayAccess.length;
        let result = {
            id: this._id,
            title: this.title,
        };
        let access = {};
        if (this.access > 160) {
            Object.assign(access, {
                All: {
                    read: !!arrayAccess[len - 3],
                    update: !!arrayAccess[len - 2],
                    delete: !!arrayAccess[len - 1]
                },
                Own: {
                    create: !!arrayAccess[len - 4],
                    read: !!arrayAccess[len - 3],
                    update: !!arrayAccess[len - 2],
                    delete: !!arrayAccess[len - 1]
                },
                Group: {
                    read: !!arrayAccess[len - 3],
                    update: !!arrayAccess[len - 2],
                    delete: !!arrayAccess[len - 1]
                }

            });
        } else if (this.access > 144) {
            Object.assign(access, {
                Own: {
                    create: !!arrayAccess[len - 4],
                    read: !!arrayAccess[len - 3],
                    update: !!arrayAccess[len - 2],
                    delete: !!arrayAccess[len - 1]
                },
                Group: {
                    read: !!arrayAccess[len - 3],
                    update: !!arrayAccess[len - 2],
                    delete: !!arrayAccess[len - 1]
                }
            });
        } else {
            Object.assign(access, {
                create: !!arrayAccess[len - 4],
                read: !!arrayAccess[len - 3],
                update: !!arrayAccess[len - 2],
                delete: !!arrayAccess[len - 1]
            });
        }
        return Object.assign(result, {access})
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
            .catch(err => console.error("!!!!!!!!User getById catch err: ", err))
    },

    /**
     * Permission list
     */
    list: async function () {
        return await this.find({})
            .sort({order: 1})
            .then(permissions => permissions)
            .catch(err => console.error("permissions getAll Catch", err));
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
    }
});

const Permission = mongoose.model('Permission', PermissionSchema);
module.exports = Permission;