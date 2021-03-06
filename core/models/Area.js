const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AreaSchema = new Schema({
    name_en: String,
    name_ar: String,
    childs: [
        {
            name_en: String,
            name_ar: String,
            status: {type: Number, default: 1},
            createAt: {type: Date, default: Date.now},
            updateAt: {type: Date, default: Date.now},
        }
    ],
    status: {type: Number, default: 1}, // 1 active, 0 deActive, 2 softDelete, 3 hardDelete
}, {timestamps: true});

/**
 * Pre-remove hook
 */

AreaSchema.pre('remove', function (next) {
    next();
});

/**
 * Methods
 */
AreaSchema.method({
    toJSON() {
       const newChilds = this.childs.map(ch => {
           return {
                id: ch._id,
                name_en: ch.name_en,
                name_ar: ch.name_ar
            }
        })
        return {
            id: this._id,
            name_en: this.name_en,
            name_ar: this.name_ar,
            childs: newChilds
        }
    }
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
    getById: function (_id) {
        return this.findById({_id})
            .then(area => area)
            .catch(err => console.error("!!!!!!!! Event getById catch err: ", err))
    },

    /**
     * Find area by identifier
     *
     * @param {String} identifier
     * @api private
     */
    list() {
        return Area.find({})
            .then(area => area)
            .catch(err => console.error("!!!!!!!! get all Area catch err: ", err));
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
            .catch(err => console.error("!!!!!!!!organization getAll catch err: ", err))
    }
});

const Area = mongoose.model('Area', AreaSchema);
module.exports = Area;