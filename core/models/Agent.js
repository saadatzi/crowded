const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10,
    // these values can be whatever you want - we're defaulting to a
    // max of 5 attempts, resulting in a 2 hour lock
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;

const AgentSchema = new Schema({
    email: {type: String, index: true, lowercase: true, unique: true, required: [true, "can't be blank"]},
    name: String,
    password: {type: String, required: true},
    status: {type: Number, default: 1},
    role: [{type: Schema.ObjectId, ref: 'Role'}],
    lastIp: String,
    call: [
        {
            type: String,
            value: String
        }
    ],
    organizationId: {type: Schema.ObjectId, ref: 'Organization', required: [true, "Organization can't be blank"]},
    lastLogin: Date,
    lastInteract: Date,
    loginAttempts: {type: Number, required: true, default: 0},
    lockUntil: Number,
}, {timestamps: true});

AgentSchema.virtual('isLocked').get(function () {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Pre-remove hook
 */

AgentSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Pre-save hook
 */
AgentSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // set the hashed password back on our user document
            user.password = hash;
            next();
        });
    });
});


/**
 * Methods
 */
AgentSchema.method({
    comparePassword: async function (candidatePassword) {
        console.log("!!!!!!!!Agent comparePassword candidatePassword: ", candidatePassword);
        return await bcrypt.compare(candidatePassword, this.password)
            .then(isMatch => isMatch)
            .catch(err => console.log("!!!!!!!!Agent getById catch err: ", err));
    },
    incLoginAttempts: async function () {
        //ToDo add log Attempts to Array{ip, time, ...}
        //// if we have a previous lock that has expired, restart at 1
        if (this.lockUntil && this.lockUntil < Date.now()) {
            return this.updateOne({
                $set: {loginAttempts: 1},
                $unset: {lockUntil: 1}
            })
                .catch(err => {
                    console.error("!!!!!!!!Agent incLoginAttempts lock expired catch err: ", err);
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
                console.error("!!!!!!!!Agent incLoginAttempts catch err: ", err);
                throw err;
            });
    }
});


/**
 * Statics
 */
AgentSchema.static({

    /**
     * Find Agent by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function (_id) {
        return this.findById({_id})
            .then(device => device)
            .catch(err => console.log("!!!!!!!!Agent getById catch err: ", err))
    },

    /**
     * Authenticate Agent
     *
     * @param {String} email
     * @param {String} password
     * @api private
     */

    getAuthenticated: async function(email, password) {
        return await this.findOne({email: email})
            .then(async user => {
                // make sure the user exists
                if (!user) {
                    throw {code: 404, message: "User not found!"}
                }

                // check if the account is currently locked
                if (user.isLocked) {
                    // just increment login attempts if account is already locked
                    return await user.incLoginAttempts()
                        .then(inc => {
                            throw {code: 401, message: "Max Attempts!"}
                        })
                        .catch(err => {
                            console.log("!!!!!!!!Agent getById catch err: ", err);
                            throw err;
                        })
                }

                // test for a matching password
                return await user.comparePassword(password)
                    .then(async isMatch => {
                        // check if the password was a match
                        if (isMatch) {
                            // if there's no lock or failed attempts, just return the user
                            if (!user.loginAttempts && !user.lockUntil) return user;
                            // reset attempts and lock info
                            return await user.updateOne({$set: {loginAttempts: 0}, $unset: {lockUntil: 1}})
                                .catch(err => {
                                    console.error("!!!!!!!!Agent getById catch err: ", err);
                                    throw err;
                                })
                            return user;
                        }

                        // password is incorrect, so increment login attempts before responding
                        await user.incLoginAttempts()
                            .then(inc => {
                                throw {code: 401, message: "Password is incorrect!"}
                            })
                            .catch(err => {
                                console.log("!!!!!!!!Agent getById catch err: ", err);
                                throw err;
                            })

                        })
                    .catch(err => {
                        console.log("!!!!!!!!Agent getById catch err: ", err);
                        throw err;
                    })

            })
            .catch(err => {
                console.log("!!!!!!!! getAuthenticated catch err: ", err)
                throw err;
            });
    },



        function (email, password, cb) {
        this.findOne({email: email}, function (err, user) {
            if (err) return cb(err);


        });
    },

    /**
     * Find use by email
     *
     * @param {String} email
     * @api private
     */
    getByEmail: async (email) => {
        return await Agent.findOne({email: email})
            .then(user => user)
            .catch(err => console.log("!!!!!!!! getByEmail catch err: ", err));
    },

    /**
     * List all Agent
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

const Agent = mongoose.model('Agent', AgentSchema);
module.exports = Agent;