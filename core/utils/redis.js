const redis = require('redis');
const settings = require('./settings');
const config = require('config');
const redisConfig = config.get('redis');

const redClient = redis.createClient({password: redisConfig.password});

module.exports = redClient;