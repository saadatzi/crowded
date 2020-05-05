const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const settings = require('../utils/settings');

const SettingSchema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
},
    {
        timestamps: true
    });



/**
 * Methods
 */
SettingSchema.method({
});

/**
 * Statics
 */
SettingSchema.static({
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
                    key: 1,
                    value: 1,
                }
            }
        ])
            .catch(err => console.error(err));
    },

    getByKey(key) {
        return this.findOne({ key })
            .catch(err => console.error("!!!!!!!! Setting getByKey catch err: ", err));
    },

    list(optFilter) {
        optFilter.filters = optFilter.filters || {
        };
        optFilter.sorts = optFilter.sorts || {
        };
        optFilter.pagination = optFilter.pagination || {
            page: 0,
            limit: settings.panel.defaultLimitPage
        };
        return this.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    key: 1,
                    value: 1,
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
                    from: 'settings',
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

const Setting = mongoose.model('Setting', SettingSchema);

module.exports = Setting;