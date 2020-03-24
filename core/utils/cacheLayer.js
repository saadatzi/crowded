const mediaModel = require('../models/mediaModel');
const cacheManager = require('cache-manager');
const redisStore = require('cache-manager-redis');
const memoryLocalCache = require('./memoryLocalCache');
const settings = require('./settings');


const multiCache = cacheManager.multiCaching([
    cacheManager.caching({
        ttl: 100,
        store: memoryLocalCache,
        maxSize: settings.memoryLocalCache.maxSize,
    }),
    cacheManager.caching({
        ttl: 300,
        store: redisStore,
        host: settings.redis.host,
        port: settings.redis.port,
        auth_pass: settings.redis.password,
        db: 0,
    })
]);


const insert = async (path, target, target_id) => {
    return await mediaModel.insert(path, target, target_id)
        .then(result => {
            const cacheKey = `${target}:${target_id}`;
            multiCache.del(cacheKey);
            return result
        })
        .catch(err => {
            console.error(err)
            throw err
            // return []
        })
};

const deleteBefore = async (id, target, target_id) => {
    return await mediaModel.deleteBefore(id, target, target_id)
        .then(result => {
            const cacheKey = `${target}:${target_id}`;
            multiCache.del(cacheKey);
            return result
        })
        .catch(err => {
            console.error(err)
            throw err
        })
};

const get = async (target, target_id) => {
    const cacheKey = `${target}:${target_id}`;
    /*return await multiCache.wrap(cacheKey, function () {
        return mediaModel.get(target, target_id)
    }, async function () {
        return await multiCache.wrap(cacheKey, function () {
            return mediaModel.get(target, target_id);
        })
    });*/

    //return from cache else from DB
    return new Promise(resolve => {
        multiCache.get(cacheKey, async function (err, result) {
            if (err) {
                throw err
            }
            if (result) {
                console.info("******* getMedia from cache ********", result)
                resolve(JSON.parse(result));
            }
            // Get from DB
            return await mediaModel.get(target, target_id)
                .then(result => {
                    if (result) {
                        multiCache.set(cacheKey, JSON.stringify(result))
                    }
                    console.info("~~~~~~~~~~~~ getMedia from DB ~~~~~~~~~~~~", result)
                    resolve(result)
                })
                .catch(err => {
                    console.error(err)
                    resolve([])
                })
        });
    });
};

const displayOrder = async (imageIds, target, target_id) => {
    console.info("@@@@@@@@@@@@ displayOrder Start: ", target);
    return await mediaModel.displayOrder(imageIds)
        .then(result => {
            console.info("******** displayOrder result: ", result);
            const cacheKey = `${target}:${target_id}`;
            multiCache.del(cacheKey);
            return result
        })
        .catch(err => {
            console.error("!!!!!!! displayOrder err: ", err)
            throw err
            // return []
        })
};

module.exports = {
    insert,
    deleteBefore,
    get,
    displayOrder
};
