const cacheManager = require('cache-manager');
const redisStore = require('cache-manager-redis');
const settings = require('./settings');


const hashForgotPassCache = cacheManager.caching(
    cacheManager.caching({
        ttl: 1800,
        store: redisStore,
        host: settings.redis.host,
        port: settings.redis.port,
        auth_pass: settings.redis.password,
        db: 0,
    })
);


const setHash = async (hash, userId) => {
    hashForgotPassCache.set(hash, userId)
};


const getHash = async (hash, shouldRemove) => {
    return new Promise((resolve, reject) => {
        hashForgotPassCache.get(hash, async function (err, result) {
            if (err) {
                reject(err)
            }
            if (result) {
                if (shouldRemove) hashForgotPassCache.del(hash, function (err) {
                    if (err) console.error("!!!! remove hash forgot Password catch err:", err)
                });
                resolve(result);
            }
            reject({code: 400, message: 'The link has expired or invalid request!'});
        });
    });
};


module.exports = {
    setHash,
    getHash,
};
