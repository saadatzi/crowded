const crypto = require('crypto');
const fs = require('fs');
const fsP = require('fs').promises;
const uuid = require('node-uuid');
const shortid = require('shortid');
const fileType = require('file-type');

const { Picsum } = require('picsum-photos')
const download = require('download');

const settings = require('./settings');

const deviceModel = require('../models/deviceModel');
const userModel = require('../models/userModel');
const adminModel = require('../models/adminModel');

const NZ = require('./nz');

function profilePicturePath(user_id) {
	return (user_id == null ? 'guest' : user_id) + '_' + uuid.v4() + '_' + shortid.generate() + '_n.jpg';
}

const pyUploader = mode => {
	if (typeof mode === 'undefined') mode = 0;

	return (req, res, next) => {
		const filename = profilePicturePath(req._user.id);

		const path = settings.media_path + settings.temp_folder + filename;
		const writableStream = fs.createWriteStream(path);

		const md5sum = crypto.createHash('md5');
		let size = 0;
		let md5 = '';
        const allowed = ['jpg'];

		req.on('data', chunk => {
			size += chunk.length;
			md5sum.update(chunk);
			writableStream.write(chunk);
		});

		req.on('end', async () => {
            writableStream.end();

            if(size == 0)
                return new NZ.Response(null, 'Nothing uploaded.', 400).send(res);

            md5 = md5sum.digest('hex');
            let shouldCheck = true;

            if(md5 == '7510b98faa4839cfa6f3df0b138657ac') { // INSERT_IMAGE:D FOR DEBUG
                const img = Picsum.url({
                    cache: false,
                    height: 500,
                    width: 500,
                    jpg: true
                });

                const imgData = await download(img);
                await fsP.writeFile(path, imgData);
                shouldCheck = false;
            }

            let v = await fileType.fromStream(fs.createReadStream(path));
            
            if(!v || allowed.indexOf(v.ext) < 0){
                try {
                    await fsP.unlink(path);
                } catch (e) {
                    console.error(e);
                }
                return new NZ.Response(v, 'Unsupported Media Type', 415).send(res);
            }

            let computed_check_hash = NZ.sha256Hmac(md5, settings.HASH_key2);
			if (!shouldCheck || computed_check_hash == req.get('x-checksum')) {
				req._uploadPath = path;
				req._uploadFilename = filename;

				return next();
			} else {
                try {
                    await fsP.unlink(path);
                } catch (e) {
                    console.error(e);
                }

				return new NZ.Response({
                    myhash:     computed_check_hash,
                    mymd5:      md5,
                }, 'Hash mismatch for uploaded media.', 400).send(res);
			}
		});
	};
};

const serveStatic = () => {
	return (req, res, next) => {
		if (req.headers['x-pyresize'] != 'DOITNOW!') return next();

        return next();

		return res.sendFile(`${settings.media_path}image-not-found.jpg`);
	};
};

const getAgent = user_agent => {
    const parts = user_agent.split('/');
    if(parts[0] == 'KidsApp' && parts.length == 3){
        const version = parts[1];
        const newPart = parts[2].split(';');
        const build = newPart[0];
        const env = newPart[1].trim();

        return {
            version,
            build,
            env
        };
    }else{
        return {
            version: 	null,
            build:		null,
            env:		null
        }
    }
}

const PWA = (redirect = true, role = 1) => {
	return async (req, res, next) => {
		let redirect_url = req.originalUrl;
		if (!global.isDevelopment) redirect_url = redirect_url.replace('/panel', '');
		if (!req.session.admin_id) {
			if (redirect) return res.redirect(`${settings.panel_route}/login?redirect_url=${redirect_url}`);

			return new NZ.Response(null, 'No Access.', 403).send(res);
		} else {
			const admin = await adminModel.get(req.session.admin_id);
			if (admin && admin.role >= role) {
				NZ.setDomainOnLocals(res);
				req._admin = admin;
				res.locals._admin = admin;
				
				adminModel.updateInteract(admin.id);

				return next();
			}
			if (redirect) return res.redirect(`${settings.panel_route}/login?redirect_url=${redirect_url}`);

			return new NZ.Response(null, 'No Access.', 401).send(res);
		}
	};
};

const Auth = (role = 0) => {
    return async (req, res, next) => {
        const token = req.get('x-token');
        const device = await deviceModel.getByToken(token);

        if(!device)
            return new NZ.Response(null, 'invalid token', 403).send(res);

        req._device = device;
        await deviceModel.updateInteract(device.id, getAgent(req.get('user-agent')));

        let user = null;
        if(device.user_id)
            user = await userModel.get(device.user_id);
        
        if(user){
            req._user = user;
            await userModel.updateInteract(user.id);
        }

        if (user == null && role > 0)
            return new NZ.Response(null, 'must be user', 401).send(res);
        
        return next();	
    };
}

module.exports = {
    serveStatic,
    internal: (req, res, next) => {
        var trustedIps = ['127.0.0.1'];
        var requestIP = req._ip;
        
        if(trustedIps.indexOf(requestIP) >= 0)
            return next();

        return new NZ.Response(null, 'Now allowed', 403).send(res);
	},
    pyUploader,
	getAgent,
	Auth,
	PWA
};