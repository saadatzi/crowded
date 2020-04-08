const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AreaSchema = new Schema({
    parentId: {type: Schema.Types.ObjectId, default: null},
    name_en: String,
    name_ar: String,
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
    createAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now},
});

/**
 * Pre-remove hook
 */

AreaSchema.pre('remove', function (next) {
    //ToDo pre-remove required...
    next();
});

/**
 * Methods
 */
AreaSchema.method({
    //ToDo method need... this.model('Animal')
});

/**
 * Statics
 */
AreaSchema.static({
    /**
     * Find area by id
     *
     * @param {ObjectId} _id
     * @api private
     */
    getById: function(_id) {
        return this.findById({_id})
        .then(area =>  area)
        .catch(err => console.log("!!!!!!!! Event getById catch err: ", err))},

    /**
     * Find area by identifier
     *
     * @param {String} identifier
     * @api private
     */
    getByIdentifier: (identifier) => {
        return Area.findOne({identifier: identifier})
            .then(area => area)
            .catch(err => console.log("!!!!!!!! getByIdentifier catch err: ", err));
        // console.log("########## getByIdentifier area: ", area)
        // if (err) {
        // }
        // return (area)
        // });
        /*return new Promise(resolve => {
            this.findOne({identifier: identifier}, (err, area) => {
                if (err) {}
                resolve(area)
            })
        });*/
    },


    /**
     * List all area
     *
     * @param {Object} options
     * @api private
     */
    getAll: (options) => {
        const criteria = options.criteria || {};
        const page = options.page || 0;
        const limit = options.limit || 30;
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

const Area = mongoose.model('Area', AreaSchema);
module.exports = Area;