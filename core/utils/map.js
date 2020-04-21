
const crypto = require('crypto');
const url = require('url');
const settings = require('./settings');
const NZ = require('./nz');


const fs = require('fs');

const style1 = [
    {
        "featureType": "road",
        "stylers": [
            {
                "hue": "#5e00ff"
            },
            {
                "saturation": -79
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "saturation": -78
            },
            {
                "hue": "#6600ff"
            },
            {
                "lightness": -47
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "lightness": 22
            }
        ]
    },
    {
        "featureType": "landscape",
        "stylers": [
            {
                "hue": "#6600ff"
            },
            {
                "saturation": -11
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "saturation": -65
            },
            {
                "hue": "#1900ff"
            },
            {
                "lightness": 8
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "weight": 1.3
            },
            {
                "lightness": 30
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "hue": "#5e00ff"
            },
            {
                "saturation": -16
            }
        ]
    },
    {
        "featureType": "transit.line",
        "stylers": [
            {
                "saturation": -72
            }
        ]
	}];

/**
 * Convert from 'web safe' base64 to true base64.
 *
 * @param  {string} safeEncodedString The code you want to translate
 *                                    from a web safe form.
 * @return {string}
 */
function removeWebSafe(safeEncodedString) {
  return safeEncodedString.replace(/-/g, '+').replace(/_/g, '/');
}

/**
 * Convert from true base64 to 'web safe' base64
 *
 * @param  {string} encodedString The code you want to translate to a
 *                                web safe form.
 * @return {string}
 */
function makeWebSafe(encodedString) {
  return encodedString.replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Takes a base64 code and decodes it.
 *
 * @param  {string} code The encoded data.
 * @return {string}
 */
function decodeBase64Hash(code) {
  // "new Buffer(...)" is deprecated. Use Buffer.from if it exists.
  return Buffer.from ? Buffer.from(code, 'base64') : new Buffer(code, 'base64');
}

/**
 * Takes a key and signs the data with it.
 *
 * @param  {string} key  Your unique secret key.
 * @param  {string} data The url to sign.
 * @return {string}
 */
function encodeBase64Hash(key, data) {
  return crypto.createHmac('sha1', key).update(data).digest('base64');
}

/**
 * Sign a URL using a secret key.
 *
 * @param  {string} path   The url you want to sign.
 * @param  {string} secret Your unique secret key.
 * @return {string}
 */
function sign(path, secret) {
  const uri = url.parse(path);
  const safeSecret = decodeBase64Hash(removeWebSafe(secret));
  const hashedSignature = makeWebSafe(encodeBase64Hash(safeSecret, uri.path));
  return url.format(uri) + '&signature=' + hashedSignature;
}

 const googleMapsStaticUrl = (lat, lng) => {
    console.log(">>>>>>>>>>>>> lat: %j, long: %j", lat, lng)
	const url = `${settings.mapImage.url}staticmap?style=${get_static_style(style1)}&key=${settings.mapImage.key}&center=${lat},${lng}&zoom=${settings.mapImage.zoom}&scale=false&size=${settings.mapImage.sizeW}x${settings.mapImage.sizeH}&maptype=${settings.mapImage.mapType}&format=png&visual_refresh=true&markers=icon:${settings.mapImage.marker}%7Cshadow:true%7C${lat},${lng}`;
     console.log(">>>>>>>>>>>>> url:", url);
	return sign(url, settings.googlemapsstaticsign);
}

function get_static_style(styles) {
    var result = [];
    styles.forEach(function(v, i, a){
      var style='';
      if (v.stylers.length > 0) { // Needs to have a style rule to be valid.
        style += (v.hasOwnProperty('featureType') ? 'feature:' + v.featureType : 'feature:all') + '|';
        style += (v.hasOwnProperty('elementType') ? 'element:' + v.elementType : 'element:all') + '|';
        v.stylers.forEach(function(val, i, a){
          var propertyname = Object.keys(val)[0];
          var propertyval = val[propertyname].toString().replace('#', '0x');
          style += propertyname + ':' + propertyval + '|';
        });
      }
      result.push('style='+encodeURIComponent(style))
    });

    return result.join('&');
  }

  

const download = require('image-downloader');
if (!fs.existsSync(`${settings.media_path}_map`)) {
    fs.mkdirSync(`${settings.media_path}_map`);
}


const googleStaticImage = (lat, lng) => {
	return new Promise(resolve => {
		const url = googleMapsStaticUrl(lat, lng);

		const filename = NZ.sha256Hmac(url, 'myMAPKEY_SECUR3') + '.png';

		fs.exists(`${settings.media_path}_map/${filename}`, exists => {
			if(exists)
				return resolve(`${settings.media_domain}_map/${filename}`);

			options = {
				url: 	url,
				dest: 	`${settings.media_path}_map/${filename}`
			};
	
			download.image(options).then(({ mfilename, image }) => {
				console.log('map downloaded');
				resolve(`${settings.media_domain}_map/${filename}`);
			})
			.catch((err) => {
				console.error(err);
				resolve(null);
			})

		});
	});
}

module.exports = {
	googleStaticImage
};