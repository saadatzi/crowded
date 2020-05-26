const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10,
    // these values can be whatever you want - we're defaulting to a
    // max of 5 attempts, resulting in a 2 hour lock
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;

const AdminSchema = new Schema({
    email: {type: String, index: true, lowercase: true, unique: true, required: [true, "can't be blank"]},
    name: String,
    password: {type: String, required: true},
    roles: [{type: Schema.ObjectId, ref: 'Role'}],
    call: [
        {
            callType: String,
            value: String
        }
    ],
    organizationId: {type: Schema.ObjectId, ref: 'Organization', required: [true, "Organization can't be blank"]},
    status: {type: Number, default: 1},
    lastIp: String,
    lastLogin: Date,
    lastInteract: Date,
    loginAttempts: {type: Number, required: true, default: 0},
    lockUntil: Number,
}, {timestamps: true});

AdminSchema.virtual('isLocked').get(function () {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Pre-remove hook
 */

AdminSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Pre-save hook
 */
AdminSchema.pre('save', function (next) {
    var admin = this;
    console.warn('######################## pre save', admin);
    // only hash the password if it has been modified (or is new)
    if (!admin.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(admin.password, salt, function (err, hash) {
            if (err) return next(err);

            // set the hashed password back on our user document
            admin.password = hash;
            next();
        });
    });
});

/**
 * Pre-Update hook
 */
AdminSchema.pre('findOneAndUpdate', function (next) {
    var admin = this.getUpdate();
    console.warn('######################## pre findOneAndUpdate', admin);

    // only hash the password if it has been modified (or is new)
    if (!admin.hasOwnProperty('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(admin.password, salt, function (err, hash) {
            if (err) return next(err);

            // set the hashed password back on our user document
            admin.password = hash;
            next();
        });
    });
});


/**
 * Methods
 */
AdminSchema.method({
    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password)
            .then(isMatch => isMatch)
            .catch(err => console.error("!!!!!!!!comparePassword bcrypt.compare getById catch err: ", err));
    },
    async incLoginAttempts() {
        //TODO add log Attempts to Array{ip, time, ...}
        //// if we have a previous lock that has expired, restart at 1
        if (this.lockUntil && this.lockUntil < Date.now()) {
            return this.updateOne({
                $set: {loginAttempts: 1},
                $unset: {lockUntil: 1}
            })
                .catch(err => {
                    console.error("!!!!!!!!Admin incLoginAttempts lock expired catch err: ", err);
                    throw err;
                });
        }
        // otherwise we're incrementing
        var updates = {$inc: {loginAttempts: 1}};
        // lock the account if we've reached max attempts and it's not locked already
        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
            updates.$set = {lockUntil: Date.now() + LOCK_TIME};
        }
        return this.updateOne(updates)
            .catch(err => {
                console.error("!!!!!!!!Admin incLoginAttempts catch err: ", err);
                throw err;
            });
    },
    dto() {
        return {
            id: this._id,
            email: this.email,
            name: this.name,
            organization: this.organization ? this.organization.name : '',
            roles: this.roles,
            call: this.call,
        };
    }
});


/**
 * Statics
 */
AdminSchema.static({

    /**
     * Find Admin by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    async getById(_id) {
        return await this.findById({_id})
            .then(admin => admin)
            .catch(err => console.error("!!!!!!!!Admin getById catch err: ", err))
    },

    /**
     * Authenticate Admin
     *
     * @param {String} email
     * @param {String} password
     * @api private
     */

    getAuthenticated: async function (email, password) {
        return await this.findOne({email: email})
            .populate('organizationId', 'name')
            // .populate('roles', 'name permissions')
            // .populate('roles.permissions.permissionId')
            .then(async admin => {
                // make sure the user exists
                if (!admin) {
                    throw {code: 404, message: "User not found!"}
                }

                // check if the account is currently locked
                if (admin.isLocked) {
                    // just increment login attempts if account is already locked
                    return await admin.incLoginAttempts()
                        .then(inc => {
                            throw {code: 401, message: "Max Attempts!"}
                        })
                        .catch(err => {
                            console.error("!!!!!!!!Admin getAuthenticated user.isLocked getById catch err: ", err);
                            throw err;
                        })
                }

                // test for a matching password
                return await admin.comparePassword(password)
                    .then(async isMatch => {
                        // check if the password was a match
                        if (isMatch) {
                            // if there's no lock or failed attempts, just return the user
                            if (!admin.loginAttempts && !admin.lockUntil) {
                                return await admin.updateOne({$set: {lastLogin: new Date()}})
                                    .then(resUpdate => admin.dto())
                                    .catch(err => console.error("!!!!!!!!DTO, Admin update lastLogin  catch err: ", err));
                            }
                            // reset attempts and lock info
                            return await admin.updateOne({$set: {loginAttempts: 0}, $unset: {lockUntil: 1}})
                                .then(resUpdate => {
                                    return admin.dto();
                                })
                                .catch(err => {
                                    console.error("!!!!!!!!Admin isMatch user.updateOne getById catch err: ", err);
                                    throw err;
                                })

                        }

                        // password is incorrect, so increment login attempts before responding
                        await admin.incLoginAttempts()
                            .then(inc => {
                                throw {code: 401, message: "Password is incorrect!"}
                            })
                            .catch(err => {
                                console.error("!!!!!!!!Admin incLoginAttempts getById catch err: ", err);
                                throw err;
                            })

                    })
                    .catch(err => {
                        console.error("!!!!!!!!Admin getAuthenticated comparePassword getById catch err: ", err);
                        throw err;
                    })

            })
            .catch(err => {
                console.error("!!!!!!!! getAuthenticated catch err: ", err)
                throw err;
            });
    },

    /**
     * Find use by email
     *
     * @param {String} email
     * @api private
     */
    async getByEmail (email) {
        return await this.findOne({email: email})
            .then(user => {
                return user;
            })
            .catch(err => {
                console.error("!!!!!!!! getByEmail catch err: ", err)
                throw err;
            });
    },

    /**
     * List all Admin
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
     * Get Many Admins
     * @param {Object} optFilter
     */
    async getManyPanel(optFilter) {

        const baseCriteria = {status: {$in: [0, 1]}};

        let regexMatch = {};
        if (optFilter.search) {
            let regex = new RegExp(optFilter.search);
            regexMatch = {
                "$or": [
                    {
                        email: {$regex: regex, $options: "i"}
                    },
                    {
                        name: {$regex: regex, $options: "i"}
                    }
                ]
            };
            if(optFilter.search.length>7){
                regexMatch.$or.push({
                    call: {$regex: regex, $options:"i"}
                })
            }
        }


        return this.aggregate([
            {$match: baseCriteria},
            {$match: regexMatch},
            {$match: optFilter.filters},
            {$sort: optFilter.sorts},
            {$skip: optFilter.pagination.page * optFilter.pagination.limit},
            {$limit: optFilter.pagination.limit},
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                }
            },
            {
                $group: {
                    _id: null,
                    items: {$push: '$$ROOT'},
                }
            },
            {
                $lookup: {
                    from: 'admins',
                    pipeline: [
                        {$match: regexMatch},
                        {$match: optFilter.filters},
                        {$count: 'total'},
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: {$arrayElemAt: ["$getTotal", 0]},
                }
            },
        ])
            .then(result => {
                let items = [],
                    total = 0;
                if (result.length > 0) {
                    total = result[0].total.total;
                    delete result[0].total;
                    items = result[0].items;
                }
                optFilter.pagination.total = total;
                return {explain: optFilter, items};
            })
            .catch(err => console.error(err));


    },


    /**
     * Get an Admin
     *
     * @param {ObjectId} adminId
     * @api private
     */
    async getOnePanel(adminId) {
        const baseCriteria = {status: {$in: [0, 1]}, _id: mongoose.Types.ObjectId(adminId)};


        return await this.aggregate([
            {$match: baseCriteria},
            //get Role Name
            {
                $lookup: {
                    from: 'roles',
                    let: {primaryRoleIds: "$roles"},
                    pipeline: [
                        // { $match: {_id: {$in: "$$primaryRoleIds"}} },
                        {$match: {$expr: {$in: ["$_id", "$$primaryRoleIds"]}}},
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                name: 1
                            }
                        },
                    ],
                    as: 'getRoles'
                }
            },
            {
                $lookup: {
                    from: 'organizations',
                    foreignField: '_id',
                    localField: 'organizationId',
                    as: 'organization'
                }
            },
            // {
            //     $group: {
            //         organization: {$first: '$organization'},
            //         roles: {$first: "$getRoles"},
            //         _id: 0,
            //         id: {$first: '$_id'},
            //         name: {$first: "$name"},
            //         email: {$first: "$email"},
            //         call: {$first: "$call"},
            //         lastIp: {$first: "$lastIp"},
            //         lastLogin: {$first: "$lastLogin"},
            //         lastInteract: {$first: "$lastInteract"},
            //         loginAttempts: {$first: "$loginAttempts"},
            //         lockUntil: {$first: "$lockUntil"},
            //         address: {$first: "$address"},
            //         createdAt: {$first: "$createdAt"},
            //         updatedAt: {$first: "$updatedAt"},
            //         isActive: {$first: "$status"},
            //     }
            // },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: 1,
                    email: 1,
                    roles: '$getRoles',
                    call: 1,
                    organization: {
                        id: {$arrayElemAt: ["$organization._id", 0]},
                        title: {$arrayElemAt: ["$organization.title", 0]},
                        // image: { $arrayElemAt: ["$organization.image", 0] },
                        image: {
                            $cond: [
                                {$ne: [{$arrayElemAt: ["$organization.image", 0]}, ""]},
                                {url: {$concat: [settings.media_domain, {$arrayElemAt: ["$organization.image", 0]}]}},
                                null
                            ]
                        }
                    },
                    lastLogin: 1,
                    lastInteract: 1,
                    address: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isActive: {$cond: {if: {$eq: ["$status", 1]}, then: true, else: false}},
                }
            }
        ])
            .then(admins => admins[0])
            .catch(err => console.error(err));

    },


    /**
     * Checks to see if given organization is related to any admin
     *
     * @param {String} id
     * @api private
     */
    organizationIsRelated: async function (id) {
        let result = await this.aggregate([
            {$match: {organizationId: mongoose.Types.ObjectId(id)}}
        ])
            .catch(err => {
                console.error(`Event interestIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
        return result.length != 0;
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
        if (newStatus === 2) record.email = record.email + '_DELETED_' + Date.now();
        return record.save();
    },

    /**
     * Checks to see if given role is related to any admin
     *
     * @param {String} id
     * @api private
     */
    roleIsRelated: async function (id) {
        return await this.aggregate([
            {$match: {roles: mongoose.Types.ObjectId(id)}}
        ])
            .then(result => result.length !== 0)
            .catch(err => {
                console.error(`Event interestIsRelated check failed with criteria id:${id}`, err);
                throw err;
            });
    },

});

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;