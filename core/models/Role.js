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
RoleSchema.method({});

/**
 * Statics
 */
RoleSchema.static({

    /**
     * Find Role by id
     *
     * @param {ObjectId} id
     * @api private
     */
    async getById(id) {
        const baseCriteria = {_id: mongoose.Types.ObjectId(id), status: {$in: [0, 1]}};
        return await this.aggregate([
            {$match: baseCriteria},
            {$unwind: "$permissions"},
            {
                $lookup: {
                    from: 'permissions',
                    localField: 'permissions.permissionId',
                    foreignField: '_id',
                    as: 'perName'
                }
            },
            // {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ["$perName", 0]}, "$$ROOT"]}}},
            {$unwind: "$perName"},
            {
                $group: {
                    _id: "$_id",
                    permissions: {
                        $push: {
                            title: '$perName.title',
                            accessLevelNum: '$permissions.accessLevel',
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
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                }
            },
        ])
            .then(result => {
                console.log(">>>>>>>>>>>>>>>>>>>>>> role detail result:", result);
                result.map(r => {
                    r.permissions.map(rp => rp.accesssLevel = binLevel2Bool(rp.accessLevelNum))
                });
                return result[0];
            })
            .catch(err => console.error("Role getById  Catch", err));

        // return this.findById({_id})
        //     .populate('permissions.permissionId')
        //     .then(role => role)
        //     .catch(err => console.error("!!!!!!!!Role getById catch err: ", err))
    },

    /**
     * get Admin role Permissions
     *
     * @param {Array} roleIds
     * @api private
     */
    async getAdminPermissions(roleIds) {
        const baseCriteria = {status: 1, _id: {$in: roleIds}};
        return await this.aggregate([
            {$match: baseCriteria},
            {$unwind: "$permissions"},
            {
                $lookup: {
                    from: 'permissions',
                    localField: 'permissions.permissionId',
                    foreignField: '_id',
                    as: 'perName'
                }
            },
            // {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ["$perName", 0]}, "$$ROOT"]}}},
            {$unwind: "$perName"},
            {
                $group: {
                    _id: "$_id",
                    permissions: {
                        $push: {
                            title: '$perName.title',
                            accessLevelNum: '$permissions.accessLevel',
                        }
                    },
                    name: {$first: `$name`},
                    status: {$first: `$status`},
                }
            },
            {
                $project: {
                    _id: 0,
                    permissions: 1,
                    name: 1,
                    status: 1
                }
            },
        ])
            .then(result => {
                // return result;
                const merged = [];
                result.map(r => {
                    r.permissions.map(rp => {
                        rp.accesssLevel = binLevel2Bool(rp.accessLevelNum);
                        let tempMerge = merged.find(old => old.title === rp.title);
                        if (!tempMerge) merged.push(rp);
                        else {
                            rp.accesssLevel = mergeAccessLevel(tempMerge.accesssLevel, rp.accesssLevel)
                            const foundIndex = merged.findIndex(old => old.title === rp.title);
                            merged[foundIndex] = rp;
                        }
                    })
                });
                return merged;
            })
            .catch(err => console.error("Role  Admin Permissions Catch", err));

        // return this.findById({_id})
        //     .populate('permissions.permissionId')
        //     .then(role => role)
        //     .catch(err => console.error("!!!!!!!!Role getById catch err: ", err))
    },

    /**
     * Get All
     *
     * @api private
     */
    async list() {
        const baseCriteria = {status: {$in: [0, 1]}};
        return await this.aggregate([
            {$match: baseCriteria},
            // {$unwind: "$permissions"},
            // {
            //     $lookup: {
            //         from: 'permissions',
            //         localField: 'permissions.permissionId',
            //         foreignField: '_id',
            //         as: 'perName'
            //     }
            // },
            // // {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ["$perName", 0]}, "$$ROOT"]}}},
            // {$unwind: "$perName"},
            // {
            //     $group: {
            //         _id: "$_id",
            //         permissions: {
            //             $push: {
            //                 title: '$perName.title',
            //                 accessLevelNum: '$permissions.accessLevel',
            //             }
            //         },
            //         name: {$first: `$name`},
            //         status: {$first: `$status`},
            //     }
            // },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: 1,
                    // permissions: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                }
            },
            {$sort: {id: 1}},
        ])
            .then(result => {
                // result.map(r => {
                //     r.permissions.map(rp => rp.accesssLevel = binLevel2Bool(rp.accessLevelNum))
                // });
                return result;
            })
            .catch(err => console.error("Role List  Catch", err));
    },

    /**
     * Check Authorization
     *
     * @param {ObjectId} userId
     * @param {Array} needPermissions
     * @api private
     */
    async authorize(userId, needPermissions) {
        let perNames = [];
        needPermissions.map(per => {
            perNames.push((Object.keys(per)[0]).toUpperCase());
        });
        return await this.aggregate([
            {$match: {status: 1}},
            {
                $lookup: {
                    from: 'admins',
                    let: {primaryRole: '$_id'},
                    pipeline: [
                        {$match: {_id: mongoose.Types.ObjectId(userId)}},
                        {$unwind: "$roles"},
                        {$match: {$expr: {$eq: ['$$primaryRole', "$roles"]}}},
                        {$project: {_id: 0, status: '$status', name: '$name'}},
                    ],
                    as: 'getUser'
                }
            },
            {$unwind: {path: "$getUser", preserveNullAndEmptyArrays: false}},
            {$unwind: "$permissions"},
            {
                $lookup: {
                    from: 'permissions',
                    let: {primaryPermissions: '$permissions.permissionId'},
                    pipeline: [
                        {$match: {title: {$in: perNames}}},
                        {$match: {$expr: {$eq: ["$_id", '$$primaryPermissions']}}},
                        {$project: {_id: 0, perId: "$_id", title: 1}},
                    ],
                    as: 'getPermissionsId'
                }
            },
            {$unwind: {path: "$getPermissionsId", preserveNullAndEmptyArrays: false}},
            // {$unwind: "$getPermissionsId"},
            // {
            //     $redact: {
            //         $cond: [{
            //             $eq: [
            //                 "$permissions.permissionId",
            //                 "$getPermissionsId.perId",
            //             ]
            //         },
            //             "$$KEEP",
            //             "$$PRUNE",
            //         ]
            //     }
            // },
            {$sort: {"permissions.accessLevel": -1}},
            {
                $project: {
                    name: 1,
                    status: 1,
                    newPermission: {
                        title: "$getPermissionsId.title",
                        access: "$permissions.accessLevel",
                        id: "$permissions.permissionId"
                    }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: {$first: `$name`},
                    status: {$first: `$status`},
                    perResult: {$push: '$newPermission'}
                }
            },
            {$sort: {_id: 1}}
        ])
            .then(permissions => {
                // console.log(">>>>>>>>>>>>>>>>>>%j<<<<<<<<<<<<<<<<", perNames);
                // console.log("permissions>>>>>>>>>>>>>>>>>>%j<<<<<<<<<<<<<<<<", permissions);
                // return permissions
                let resultAccess = [];
                let accessLevel = {};
                needPermissions.map(np => {
                    const perName = (Object.keys(np)[0]).toUpperCase();
                    const perValue = Object.values(np)[0];
                    const arrValue = perValue.toUpperCase().split('');
                    const valueMap = {C: 4, R: 3, U: 2, D: 1};

                    accessLevel[perName] = [];

                    //iterate ['C', 'R', 'U', 'D']
                    arrValue.map(value => {
                        let maxValue = 0;
                        let accessPerNeed = [],
                            isNewValue = true;
                        permissions.map(permission => {
                            // console.log(`//////////////////////////////////////////////////////////////////////////////`);
                            // console.log("permission **************", permission);
                            const findPermissions = permission.perResult.filter(find => find.title === perName);
                            findPermissions.map(fp => {
                                const arrayAccess = Array.from(String((fp.access).toString(2)), Number);
                                const len = arrayAccess.length;

                                // console.log(`==========================================================================`);
                                // console.log(`@@@@@@@@@@@@@@@@@@ np: %j`, np);
                                // console.log(`@@@@@@@@@@@@@@@@@@ findPermission: %j`, fp);
                                // console.log(`@@@@@@@@@@@@@@@@@@ perName: ${perName}, value: ${value}, arrayAccess: ${arrayAccess}`);
                                // console.log(`@@@@@@@@@@@@@@@@@@ arrayAccess[len - valueMap[value]]`, arrayAccess[len - valueMap[value]]);
                                // console.log(`@@@@@@@@@@@@@@@@@@ !!arrayAccess[len - valueMap[value]]`, !!arrayAccess[len - valueMap[value]]);

                                if (fp.access > maxValue && !!arrayAccess[len - valueMap[value]]) {
                                    maxValue = fp.access;
                                    const level = maxValue > 160 ? 'ANY' : maxValue > 144 ? 'GROUP' : 'OWN';
                                    if (!isNewValue) accessLevel[perName].pop();
                                    accessLevel[perName].push({[value]: {level, value: maxValue}});
                                    isNewValue = false;
                                }
                                accessPerNeed.push(!!arrayAccess[len - valueMap[value]]);
                                // console.log(`@@@@@@@@@@@@@@@@@@ accessPerNeed: %j`, accessPerNeed);
                            })
                        });
                        resultAccess.push(accessPerNeed.some(Boolean));
                    })
                });
                return {access: resultAccess.every(Boolean), accessLevel};
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
            .catch(err => console.error("!!!!!!!!organization getAll catch err: ", err))
    },

    /**
     *
     * @param {String} id - id of the record
     * @param {Number} newStatus - new status you want to set
     * @param {Number} validateCurrent - a function returning a boolean checking old status
     */
    async setStatus(id, newStatus, validateCurrent = function (old) {
        return true
    }) {
        let record = await this.findOne({_id: id}).catch(err => console.error(err));
        let currentState = record.status;
        if (!validateCurrent(currentState)) throw {message: "Changing status not permitted!"};
        record.status = newStatus;
        if (newStatus === 2) record.name = record.name + '_DELETED_' + Date.now();
        return record.save();
    }
});

function binLevel2Bool(number) {
    const arrayAccess = Array.from(String((number).toString(2)), Number);
    const len = arrayAccess.length;
    return {
        create: !!arrayAccess[len - 4],
        read: !!arrayAccess[len - 3],
        update: !!arrayAccess[len - 2],
        delete: !!arrayAccess[len - 1]
    }
}

function mergeAccessLevel(oldAL, newAL) {
    return {
        create: oldAL.create || newAL.create,
        read: oldAL.read || newAL.read,
        update: oldAL.update || newAL.update,
        delete: oldAL.delete || newAL.delete,
    }
}


const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;


/*
* Access Level Map
                 Any   Group   Create   Read   Update  Delete
 128     64      32      16       8       4       2       1
__________________________________________________________________________________________________
  1       0       0       0       0       0       0       1      => 1   129   [Delete]
  1       0       0       0       0       0       1       0      => 2   130   [Update]
  1       0       0       0       0       0       1       1      => 3   131   [Update, Delete]
  1       0       0       0       0       1       0       0      => 4   132   [Read]
  1       0       0       0       0       1       0       1      => 5   133   [Read, Delete]
  1       0       0       0       0       1       1       0      => 6   134   [Read, Update]
  1       0       0       0       0       1       1       1      => 7   135   [Read, Update, Delete]
  1       0       0       0       1       0       0       0      => 8   136   [Create]
  1       0       0       0       1       0       0       1      => 9   137   [Create, Delete]
  1       0       0       0       1       0       1       0      => 10  138   [Create, Update]
  1       0       0       0       1       0       1       1      => 11  138   [Create, Update, Delete]
  1       0       0       0       1       1       0       0      => 12  140   [Create, Read]
  1       0       0       0       1       1       0       1      => 13  141   [Create, Read, Delete]
  1       0       0       0       1       1       1       0      => 14  142   [Create, Read, Update]
  1       0       0       0       1       1       1       1      => 15  143   [Create, Read, Update, Delete]
_______________________________________________________________________ ___________________________
  1       0       0       1       0       0       0       0      => 0   144   []
  1       0       0       1       0       0       0       1      => 1   145   [Delete]
  1       0       0       1       0       0       1       0      => 2   146   [Update]
  1       0       0       1       0       0       1       1      => 3   147   [Update, Delete]
  1       0       0       1       0       1       0       0      => 4   148   [Read]
  1       0       0       1       0       1       0       1      => 5   149   [Read, Delete]
  1       0       0       1       0       1       1       0      => 6   150   [Read, Update]
  1       0       0       1       0       1       1       1      => 7   151   [Read, Update, Delete]
  1       0       0       1       1       0       0       0      => 8   152   [Create]
  1       0       0       1       1       0       0       1      => 9   153   [Create, Delete]
  1       0       0       1       1       0       1       0      => 10  154   [Create, Update]
  1       0       0       1       1       0       1       1      => 11  155   [Create, Update, Delete]
  1       0       0       1       1       1       0       0      => 12  156   [Create, Read]
  1       0       0       1       1       1       0       1      => 13  157   [Create, Read, Delete]
  1       0       0       1       1       1       1       0      => 14  158   [Create, Read, Update]
  1       0       0       1       1       1       1       1      => 15  159   [Create, Read, Update, Delete]
___________________________________________________________________________________________________
  1       0       1       0       0       0       0       0      => 0   160   []
  1       0       1       0       0       0       0       1      => 1   161   [Delete]
  1       0       1       0       0       0       1       0      => 2   162   [Update]
  1       0       1       0       0       0       1       1      => 3   163   [Update, Delete]
  1       0       1       0       0       1       0       0      => 4   164   [Read]
  1       0       1       0       0       1       0       1      => 5   165   [Read, Delete]
  1       0       1       0       0       1       1       0      => 6   166   [Read, Update]
  1       0       1       0       0       1       1       1      => 7   167   [Read, Update, Delete]
  1       0       1       0       1       0       0       0      => 8   168   [Create]
  1       0       1       0       1       0       0       1      => 9   179   [Create, Delete]
  1       0       1       0       1       0       1       0      => 10  170   [Create, Update]
  1       0       1       0       1       0       1       1      => 11  171   [Create, Update, Delete]
  1       0       1       0       1       1       0       0      => 12  172   [Create, Read]
  1       0       1       0       1       1       0       1      => 13  173   [Create, Read, Delete]
  1       0       1       0       1       1       1       0      => 14  174   [Create, Read, Update]
  1       0       1       0       1       1       1       1      => 15  175   [Create, Read, Update, Delete]
* */