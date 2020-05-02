const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SupportSchema = new Schema({
    name: {type: String, required: [true, "can't be blank"]},
    message: {type: String, required: [true, "can't be blank"]},
    status: {type: Number, default: 1},
}, {timestamps: true});

/**
 * Pre-remove hook
 */

SupportSchema.pre('remove', function (next) {
    next();
});

/**
 * Methods
 */
SupportSchema.method({});

/**
 * Statics
 */
SupportSchema.static({

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
            .catch(err => console.error("Support List  Catch", err));
    },

    /**
     * Check Authorization
     *
     * @param {ObjectId} userId
     * @param {Array} needPermissions
     * @param {Array} perNameNeed
     * @api private
     */
    async authorize(userId, needPermissions, perNameNeed) {
        return await this.aggregate([
            {$match: {status: 1}},
            {
                $lookup: {
                    from: 'admins',
                    let: {primarySupport: '$_id'},
                    pipeline: [
                        {$match: {_id: mongoose.Types.ObjectId(userId)}},
                        {$unwind: "$Support"},
                        {$match: {$expr: {$eq: ['$$primarySupport', "$Support"]}}},
                        {$project: {_id: 0, status: '$status', name: '$name'}},
                    ],
                    as: 'getUser'
                }
            },
            {$unwind: {path: "$getUser", preserveNullAndEmptyArrays: false}},
            {
                $lookup: {
                    from: 'permissions',
                    let: {primaryPermissions: '$permissions'},
                    pipeline: [
                        {$match: {title: {$in: perNameNeed}}},
                        // {$match: {$expr: {$eq: ["$_id", '$$primaryPermissions']}}},
                        {$project: {_id: 0, perId: "$_id", title: 1}},
                    ],
                    as: 'getPermissionsId'
                }
            },
            {$unwind: "$permissions"},
            {$unwind: "$getPermissionsId"},
            {
                $redact: {
                    $cond: [{
                        $eq: [
                            "$permissions.permissionId",
                            "$getPermissionsId.perId",
                        ]
                    },
                        "$$KEEP",
                        "$$PRUNE",
                    ]
                }
            },
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
                let resultAccess = [];
                let accessLevel = {};
                needPermissions.map(np => {
                    const perName = Object.keys(np)[0];
                    const perValue = Object.values(np)[0];
                    const arrValue = perValue.toUpperCase().split('');
                    const valueMap = {C: 4, R: 3, U: 2, D: 1};

                    accessLevel[perName] = [];

                    arrValue.map(value => {
                        let maxValue = 0;
                        let accessPerNeed = [],
                            isNewValue = true;
                        permissions.map(permission => {
                            const findPermission = permission.perResult.find(find => find.title === perName);
                            if (findPermission) {
                                const arrayAccess = Array.from(String((findPermission.access).toString(2)), Number);
                                const len = arrayAccess.length;
                                if (findPermission.access > maxValue && !!arrayAccess[len - valueMap[value]]) {
                                    maxValue = findPermission.access;
                                    const level = maxValue > 160 ? 'ANY' : maxValue > 144 ? 'GROUP' : 'OWN';
                                    if (!isNewValue) accessLevel[perName].pop();
                                    accessLevel[perName].push({[value]: {level, value: maxValue}});
                                    isNewValue = false;
                                }
                                accessPerNeed.push(!!arrayAccess[len - valueMap[value]])
                            }
                        });
                        resultAccess.push(accessPerNeed.some(Boolean));

                    })
                });
                return {access: resultAccess.every(Boolean), accessLevel};
            })
            .catch(err => console.error("Support List  Catch", err));
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


const Support = mongoose.model('Support', SupportSchema);
module.exports = Support;
