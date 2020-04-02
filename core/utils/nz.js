const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const settings = require('./settings');

const Random = require('random-js').Random;
const random = new Random();

const Hashids = require('hashids/cjs');
const hashids = new Hashids(settings.hashids_seed);

const ncsLocalization = require('./ncs/ncs.localization');

const md5 = data => {
    return crypto.createHash('md5').update(data).digest("hex");
}

const sha256 = data => {
    return crypto.createHash('sha256').update(data).digest('hex');
}

const sha512 = data => {
    return crypto.createHash('sha512').update(data).digest('hex');
}

const sha256Hmac = (data, key) => {
	return crypto.createHmac('sha256', key).update(data).digest('hex')
}

const sha512Hmac = (data, key) => {
	return crypto.createHmac('sha512', key).update(data).digest('hex')
}

// const manageFolderExistance = folderPath => {
// 	return new Promise(resolve => {
// 		let mediaPath = `${settings.NCS_RESOURCES}`;
// 		if (folderPath) mediaPath = path.join(mediaPath, folderPath);
// 		fs.exists(mediaPath, exists => {
// 			if (!exists) {
// 				fs.mkdir(mediaPath, err => {
// 					if (err) {
// 						console.log(err);
// 					}
// 					resolve(true);
// 				});
// 			} else {
// 				resolve(true);
// 			}
// 		});
// 	});
// };

const setDomainOnLocals = res => {
	res.locals.API_BASE = settings.api_base;
	res.locals.PANEL_ROUTE = settings.panel_route;
	res.locals.MEDIA_BASE = settings.media_domain;
};

const generateRandomFolder = (foldername, generatorSeed = 3) => {
	return new Promise(resolve => {
		const hashidsRandInt = new Array(generatorSeed).fill(0).map(() => random.integer(0, settings.hashids_max));
		const folder = hashids.encode(hashidsRandInt);
		console.log('*************** generateRandomFolder settings.media_path: ', settings.media_path);
		const folderPath = path.join(settings.media_path, foldername, folder);
		fs.mkdir(folderPath, { recursive: true }, async () => {
            fs.chmod(folderPath, 0o777, () => {
                resolve(`${foldername}/${folder}`);
            })
		});
	});
};

const outputUser = (user, request = null) => {
    var us = {};
    us.id = user.id;
    us.name = user.name;
    us.email = user.email;
    us.phone = user.phone;
    us.profile_picture = user.profilepicture ? `${settings.cdn_domain}${user.profilepicture}` : null;
    us.has_password = user.password ? true : false;

    us.location = 'Not Determined';
    if (request && request.get('geoip_country_name')) {
        us.location = request.get('geoip_country_name');
    }

    return us;
}

const Response = function (data = {}, msg = null, code = 200, msg_type) {
	this.response = {
		meta: {
			code: code,
			msg: msg
		},
		data: data
	};
	if(msg_type){
		this.response.meta.msgType = msg_type;
	}else{
		if(code < 400){
			this.response.meta.msgType = 1;
		}else{
			this.response.meta.msgType = 2;
		}
	}
	
	this.setCodeMsg = function(code, msg = null){
		this.response.meta.code = code;
		this.response.meta.msg = msg;
	}
	
	this.setData = function(data){
		this.response.data = data;
	}
	
	this.send = function(res){
		this.response.meta.msg = ncsLocalization.get(this.response.meta.msg, res._lang);
		res.status(code).send(this.response);
	}
}

const ResponsePage = function (items, paginate, total) {
	const obj = {
		items: items,
		pagination: {
			more_items: paginate ? true : false,
			cursor: paginate ? `${paginate}` : null
		}
	};
	if(typeof total === 'number')
		obj.pagination.total_items = total;

	return new Response(obj);
};

module.exports = {
    // generateRandomFolder,
    randomIntInc: (low, high) => {
        return Math.floor(Math.random() * (high - low + 1) + low)
    },
	Response,
	ResponsePage,
    md5,
	sha256,
	sha512,
	sha256Hmac,
	sha512Hmac,
    onlyUnique: (value, index, self) => { 
        return self.indexOf(value) === index;
    },
	outputUser,
	generateRandomFolder,
	setDomainOnLocals
};

