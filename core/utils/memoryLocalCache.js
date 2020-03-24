class memoryLocalCache {
    constructor(options) {
        this.options = options;
        this.maxSize = options.maxSize ? options.maxSize : 100;
        this.data = new Map()
    }

    get(key, options, cb) {
        if (typeof options === 'function') {
            cb = options
        }
        console.info("$$$$$$$$$$$$ memoryLocalCache get key: ", key);
        console.info("$$$$$$$$$$$$ memoryLocalCache size: ", this.data.size);
        cb(null, this.data.get(key) || null)
    }

    set(key, value, options, cb) {
        if (typeof options === 'function') {
            cb = options
        }

        if (this.data.size === this.maxSize) {
            var keys = Array.from(this.data.keys()).slice(0, 1);
            this.data.delete(keys[0]);
        }
        this.data.set(key, value);

        console.info("$$$$$$$$$$$$ memoryLocalCache set key: ", key);
        console.info("$$$$$$$$$$$$ memoryLocalCache size: ", this.data.size);

        cb(null, true)
    }

    del(key, options, cb) {
        if (typeof options === 'function') {
            cb = options
        }

        if (typeof cb !== 'function') {
            cb = function () {
            }
        }

        if (this.data.has(key)) {
            this.data.delete(key)
        }
        console.info("$$$$$$$$$$$$ memoryLocalCache del key: ", key);
        console.info("$$$$$$$$$$$$ memoryLocalCache size: ", this.data.size);

        cb(null, null)
    }

    reset(cb) {
        if (typeof cb !== 'function') {
            cb = function () {
            }
        }

        this.data.clear()

        cb(null, null)
    }

    isCacheableValue(value) {
        if (this.options.isCacheableValue) {
            return this.options.isCacheableValue(value)
        }

        return value !== null && value !== undefined
    }

    getClient(cb) {
        return cb(null, {
            client: this
        })
    }

    keys(pattern, cb) {
        const keys = this.data.keys();
        let checkPattern = true;

        if (typeof pattern === 'function') {
            cb = pattern
            checkPattern = false
        }
        if (checkPattern) {
            const matches = [];
            for (let key of keys) {
                if (key.includes(pattern)) {
                    matches.push(key)
                }
            }
            return cb(null, matches)
        }


        cb(null, keys)
    }
}
module.exports = {
    create : function (args) {
        return new memoryLocalCache(args);
    }
};