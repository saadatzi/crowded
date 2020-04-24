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


const insertForgotHash = async (hash, userId) => {
    hashForgotPassCache.set(hash, userId)
};


const getForgotHash = async (hash) => {
    return new Promise(resolve => {
        hashForgotPassCache.get(hash, async function (err, result) {
            if (err) {
                throw err
            }
            if (result) {
                hashForgotPassCache.del(hash, function(err) {console.error("!!!! remove hash forgot Password catch err:", err)});
                resolve(result);
            }
            throw {code: 400, message: 'The link has expired or invalid request!'}
        });
    });
};


module.exports = {
    insertForgotHash,
    getForgotHash,
};
