const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name: {type: String, unique: true, lowercase: true, required: [true, "can't be blank"]},
    permissions: [
        {
            permissionId: {type: Schema.ObjectId, ref: 'Permission'},
            accessLevel: {type: Number, default: 0}
        }
    ],
    weight: {type: Number, default: 0},
    status: {type: Number, default: 1},
}, {timestamps: true});

/**
 * Pre-remove hook
 */

RoleSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
RoleSchema.method({
    //TODO method need... this.model('Interest')
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
     * Get All
     *
     * @param {String} token
     * @api private
     */
    async list() {
        return await this.aggregate([
            {
                $lookup: {
                    from: 'permissions',
                    localField: 'permissions.permissionId',
                    foreignField: '_id',
                    as: 'perName'
                }
            },
            {$unwind: "$permissions"},
            {
                $group: {
                    _id: "$_id",
                    permissions: {
                        $push: {
                            title: {$arrayElemAt: ['$perName.title', 0]},
                            accessLevel: binLevel2Bool('permissions.accessLevel')
                        }
                    },
                    name: {$first: `$name`},
                    status: {$first: `$status`},
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: 1,
                    permissions: 1,
                    status: 1,
                }
            },
        ])
            .catch(err => console.error("Role List  Catch", err));
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

function binLevel2Bool(number) {
    console.warn(">>>>>>>>>>>>>>> binLevel2Bool number: ", number);
    const arrayAccess = Array.from(String((Number(number)).toString(2)), Number);
    console.warn(">>>>>>>>>>>>>>> binLevel2Bool arrayAccess: ", arrayAccess);
    return {create: !!arrayAccess[1], read: !!arrayAccess[2], update: !!arrayAccess[3], delete: !!arrayAccess[4]}
}

const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;