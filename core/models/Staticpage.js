const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaticpageSchema = new Schema({
    alias: 	 { type: String, required: true },
    name_en: { type: String, required: true },
	name_ar: { type: String, required: true },
	html_en: { type: String, required: true },
	html_ar: { type: String, required: true }
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

        return this.findById({ _id }).exec()
	},
	
	getByAlias(alias) {
        return this.findOne({ alias })
            .then(staticpage => staticpage)
            .catch(err => console.log("!!!!!!!! getByAlias catch err: ", err));
	}

});

const Staticpage = mongoose.model('Staticpage', StaticpageSchema);

module.exports = Staticpage;