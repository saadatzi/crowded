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
    next();
});

/**
 * Methods
 */
RoleSchema.method({
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
                            // accessLevel: {$binLevel2Bool: '$permissions.accessLevel'},
                            accessLevelNum: '$permissions.accessLevel'
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
            .then(result => {
                result.map(r => {
                    r.permissions.map(rp => rp.accesssLevel = binLevel2Bool(rp.accessLevelNum))
                });
                return result;
            })
            .catch(err => console.error("Role List  Catch", err));
    },

    /**
     * Get All
     *
     * @param {ObjectId} userId
     * @param {Array} needPermissions
     * @api private
     */
    async authorize(userId, needPermissions) {
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
                            // accessLevel: {$binLevel2Bool: '$permissions.accessLevel'},
                            accessLevelNum: '$permissions.accessLevel'
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
            .then(result => {
                result.map(r => {
                    r.permissions.map(rp => rp.accesssLevel = binLevel2Bool(rp.accessLevelNum))
                });
                return result;
            })
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
    const arrayAccess = Array.from(String((number).toString(2)), Number);
    return {create: !!arrayAccess[1], read: !!arrayAccess[2], update: !!arrayAccess[3], delete: !!arrayAccess[4]}
}

const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;

/*
* Access Level Map
     Create-Read-Update-Delete
  16   8     4    2      1
__________________________________________________________
  1    0     0    0      1  => 17   [Delete]
  1    0     0    1      0  => 18   [Update]
  1    0     0    1      1  => 19   [Update, Delete]
  1    0     1    0      0  => 20   [Read]
  1    0     1    0      1  => 21   [Read, Delete]
  1    0     1    1      0  => 22   [Read, Update]
  1    0     1    1      1  => 23   [Read, Update, Delete]
  1    1     0    0      0  => 24   [Create]
  1    1     0    0      1  => 25   [Create, Delete]
  1    1     0    1      0  => 26   [Create, Update]
  1    1     0    1      1  => 27   [Create, Update, Delete]
  1    1     1    0      0  => 28   [Create, Read]
  1    1     1    0      1  => 29   [Create, Read, Delete]
  1    1     1    1      0  => 30   [Create, Read, Update]
  1    1     1    1      1  => 31   [Create, Read, Update]
____________________________________________________________
* */