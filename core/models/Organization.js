const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    title_en: {type: String, unique: true, required: [true, "can't be blank"]},
    title_ar: {type: String, unique: true, required: [true, "can't be blank"]},
    status: {type: Number, default: 1},
    image: { type: String, default: '' },
    address_en: {type:String, default:''},
    address_ar: {type:String, default:''},
    phones: [{
        type: String
    }]
}, {timestamps: true});
    

/**
 * Pre-remove hook
 */

OrganizationSchema.pre('remove', function (next) {
    //TODO pre-remove required...
    next();
});

/**
 * Methods
 */
OrganizationSchema.method({
    toJSON() {
        return {
            id: this._id,
            name: this.name,
            isActive: !!this.status,
        }
    }
});

/**
 * Statics
 */
OrganizationSchema.static({

    /**
     * Find Organization by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getByI(_id) {
        return this.findById({_id})
            .then(organization =>  organization)
            .catch(err => console.error("!!!!!!!!organization getById catch err: ", err))},


    /**
     * List all User
     *
     * @param {Object} options
     * @api private
     */

    getAll(options){
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

const Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;