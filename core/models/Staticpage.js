const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaticpageSchema = new Schema({
    alias: { type: String, required: true, unique:true},
    name_en: { type: String, required: true },
    name_ar: { type: String, required: true },
    html_en: { type: String, required: true },
    html_ar: { type: String, required: true },
    in_app: {type: Boolean, required: true}
},
    {
        timestamps: true
    });



/**
 * Methods
 */
StaticpageSchema.method({
});

/**
 * Statics
 */
StaticpageSchema.static({
    /**
    * Find Staicpage
    *
    * @param {ObjectId} _id
    * @api private
    */
    getById(_id) {
        return this.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(_id) } },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    alias: 1,
                    name_en: 1,
                    name_ar: 1,
                    html_en: 1,
                    html_ar: 1,
                    in_app: 1,
                }
            }
        ])
            .catch(err => console.error(err));
    },

    getByAlias(alias) {
        return this.findOne({ alias })
            .then(staticpage => staticpage)
            .catch(err => console.log("!!!!!!!! getByAlias catch err: ", err));
    },

    list(optFilter) {
        return this.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    alias: 1,
                    name_en: 1,
                    name_ar: 1,
                    html_en: 1,
                    html_ar: 1,
                    in_app: 1,
                }
            },
            {
                $group: {
                    _id: null,
                    items: { $push: '$$ROOT' },
                }
            },
            {
                $lookup: {
                    from: 'staticpages',
                    pipeline: [
                        { $count: 'total' },
                    ],
                    as: 'getTotal'
                }
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                    total: { $arrayElemAt: ["$getTotal", 0] },
                }
            }
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
                return { explain: optFilter, items };
            })
            .catch(err => console.error(err));
    }

});

const Staticpage = mongoose.model('Staticpage', StaticpageSchema);

module.exports = Staticpage;