const axios = require('axios');
const CryptoJS = require('crypto-js');

let appId = '';
let locs = {};
let dict = {};
let newKeys = [];
let defaultOptions = {
	'NizekUtils.Localizations.Dump.Enabled':   true,
	'NizekUtils.Localizations.Dump.Interval':  30,
	'NizekUtils.Localizations.Fetch.Interval': 30
};

const init = async (id, options) => {
	appId = id;
	if (!appId) return;

	if (typeof options === 'object')
		Object.entries(options).forEach(([k, v]) => {
			if (defaultOptions[k] !== undefined) {
				defaultOptions[k] = k.endsWith('Interval') ? v * 1000 : v;
			}
		});

	await pullLocalizations();
	pushIntervalInit();
	pullIntervalInit();
};
// const ptest = () => {
// 	fetch(`https://api.ncs.nizek.com/localization/${appId}`).then(res => res.json())
// 	.then(res => {
// 		console.log('good', res)
// 	}).catch(err => {
// 		console.error('ptest error', err);
// 	})
// }
const pullLocalizations = async () => {
	try {
		// ptest();
		const url = `https://api.ncs.nizek.com/localization/${appId}`;
		//console.log('pulling', url);
		let { data } = await axios.get(url).catch(e => console.error('NCS ERROR B', e.toString()));
		// let { data } = await fetch(url).then(res => res.json()).catch(e => console.error('NCS ERROR B', e.toString()));
		data = data.data;
		if (data && data.items) {
			for(localization of data.items){
			// data.items.forEach(async localization => {
				// console.log(localization)
				const identifier = localization.identifier;
				if (!locs[identifier]) {
					locs[identifier] = localization;
				}
				if (locs[identifier].checksum !== localization.checksum || !dict[identifier]) {
					await pullLocalizationValues(identifier);
				} else {
					//console.log('identifier', identifier, 'is sync');
				}
			// });
			}
		}
	} catch (e) {
		console.log(e.toString());
	}
};

const pullLocalizationValues = async identifier => {
	const url = `https://api.ncs.nizek.com/localization/${identifier}/${appId}`;
	//console.log('pulling', url);
	let { data } = await axios.get(url).catch(e => console.error('NCS ERROR C', e.toString()));
	data = data.data;
	if (data && data.values) {
		if (!dict[identifier]) dict[identifier] = {};
		Object.entries(data.values).forEach(([k, v]) => {
			dict[identifier][k] = v;
		});
	}
};

const pushIntervalInit = () => {
	setInterval(() => {
		//console.log('push interval hit');
		pushNewKeys();
	}, defaultOptions['NizekUtils.Localizations.Dump.Interval']);
};
const pullIntervalInit = () => {
	setInterval(() => {
		//console.log('pull interval hit');
		pullLocalizations();
	}, defaultOptions['NizekUtils.Localizations.Fetch.Interval']);
};

const pushNewKeys = () => {
	if (!newKeys.length) {
		//console.log('nothing to push');

		return;
	}

	function checksum(data) {
		return CryptoJS.HmacSHA256(JSON.stringify(data), 'GP4XZx86ATLQyLsmo6B8').toString();
	}

	const keys = newKeys.slice();
	newKeys = [];

	const url = `https://api.ncs.nizek.com/localization/dump/${appId}`;
	// console.log(keys);//console.log('pushing', url);
	axios
		.post(url, {
			values:   keys,
			checksum: checksum(keys)
		})
		.then(res => {
			// console.log(`PUSH statusCode: ${res.status}`);
			// console.log(res.data.data);
		})
		.catch(error => {
			console.error('NCS ERROR A', error);
		});
};

const get = (word, localization) => {
	if(!word) return word;

	// console.log('looking for word', word);
	if (!localization || !dict[localization] || dict[localization][word] === undefined) {
		newKeys.push(word);
		// console.log('added the word', word);
		return word;
	} else {
		// console.log('found the word', word);
		return dict[localization][word] == null ? word : dict[localization][word];
	}
};

module.exports = {
	init,
	get
};
// get('test_ncs_localization', 'en');
