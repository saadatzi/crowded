/**
 * Module dependencies.
 */
const Area = require('../models/Area');


const areaController = function () {
};

/**
 * Add new Area
 *
 * @param {Object || Array} newArea
 *
 * @return {ObjectId} interestId
 */
areaController.prototype.add = async (newArea) => {
    if (Array.isArray(newArea)) { //newArea instanceof Array
        return await Area.insertMany(newArea)
            .then(room => room)
            .catch(err => {
                console.log("!!!Area many save failed: ", err);
                throw err;
            })
    } else {
        return await Area.create(newArea)
            .then(room => {
                console.log("***Area save success room._id", room);
                return room;
            })
            .catch(err => {
                console.log("!!!Area save failed: ", err);
                throw err;
            })
    }
};

/**
 * get Area
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Area
 */
areaController.prototype.get = async (optFilter) => {
    if (!optFilter || optFilter instanceof Object) { //newArea instanceof Array
        return await Area.list()
            .then(areas => areas)
            .catch(err => {
                console.log("!!!Area getAll failed: ", err);
                throw err;
            })
    } else {
        return await Area.get(optFilter)
            .then(result => {
                console.log(`***Area get by id ${optFilter} result: `, result);
                return result;
            })
            .catch(err => {
                console.log("!!!Area get failed: ", err);
                throw err;
            })
    }
};

/**
 * remove Area
 *
 * @param {Object || ObjectId} optFilter
 *
 * @return Query
 */
areaController.prototype.remove = async (optFilter) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId
            return await Area.remove(optFilter)
                .then(result => {
                    console.log("***Area  Remove many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Area Remove failed: ", err);
                    throw err;
                })
        } else {
            return await Area.findByIdAndRemove(optFilter)
                .then(result => {
                    console.log(`***Area Remove by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Area Remove failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for remove Object conditions or Id is required!'}
    }


};

/**
 * Update Area
 *
 * @param {Object || ObjectId} optFilter
 * @param {Object} newValue
 *
 * @return Query
 */
areaController.prototype.update = async (optFilter, newValue) => {
    if (optFilter) {
        if (optFilter instanceof Object) { //instanceof mongoose.Types.ObjectId

            return await Area.updateMany(optFilter, newValue)
                .then(result => {
                    console.log("***Area  Update many result: ", result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Area Update failed: ", err);
                    throw err;
                })
        } else {

            return await Area.findByIdAndUpdate(optFilter, newValue)
                .then(result => {
                    console.log(`***Area Update by id ${optFilter} result: `, result);
                    return result;
                })
                .catch(err => {
                    console.log("!!!Area Update failed: ", err);
                    throw err;
                })
        }
    } else {
        throw {errMessage: 'for Update Object conditions or Id is required!'}
    }


};

module.exports = new areaController();
