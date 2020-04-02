const redisDb = require('redis');
const {redis} = require('./settings');

const redClient = redisDb.createClient({password: redis.password});

module.exports = redClient;