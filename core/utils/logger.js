const logger = require('morgan');
const printf = require('printf');
const moment = require('moment-timezone');

logger.token('realip', function (req, res) {
	return printf('% 15s', req._ip);
});

logger.token('method2', function (req, res) {
	return printf('% 4s', req.method);
});

logger.token('agent', function (req, res) {
	return req.headers['user-agent'];
});

logger.token('uss', function (req, res) {
	if (req._user) {
		return req._user.email || req._user.phone;
	} else if (req._admin) {
		return req._admin.email;
	} else {
		return '';
	}
});

logger.token('country', function(req, res){
	if(req.headers['geoip_country_code'])
		return `[${req.headers['geoip_country_code']}]`;
	return "[--]";
})

function compile(format) {
	var fmt = format.replace(/"/g, '\\"')
	var js = '  return "' + fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, function (_, name, arg) {
		return '"\n    + (tokens["' + name + '"](req, res, ' + String(JSON.stringify(arg)) + ') || "-") + "'
	}) + '";'
	return new Function('tokens, req, res', js);
}

logger.token('subdomain', function (req, res) {
	var domain = req.headers.host;
	var subDomain = domain.split('.');
	var subsDomain = "[]";
	if (subDomain.length > 2) {
		var subs = [];
		for (var i = 0; i < subDomain.length - 2; i++) subs.push(subDomain[i]);
		subsDomain = "[" + subs.join(".") + "]";
	}
	return subsDomain;
});

logger.token('tehranTime', function (req, res) {
	return moment().tz('Asia/Tehran').format('HH:mm:ss');
});

logger.token('wid', function (req, res) {
	return process.env.NODE_APP_INSTANCE;
});

logger.format('PyLog', function developmentFormatLine(tokens, req, res) {
	var status = res._header ? res.statusCode : undefined;

	var color = status >= 500 ? 31 // red
		: status >= 400 ? 33 // yellow
			: status >= 300 ? 36 // cyan
				: status >= 200 ? 32 // green
					: 0 // no color

	var fn = developmentFormatLine[color];

	if (!fn) {
		fn = developmentFormatLine[color] = compile('\x1b[31m:wid \x1b[36m:tehranTime \x1b[0m:method2 :realip :country :uss | :url \x1b['
			+ color + 'm:status \x1b[0m:response-time ms - :res[content-length]\x1b[0m')
	}

	return fn(tokens, req, res);
});

const isAPIChecker = req => {
	return	req.headers['x-pytest'] == 'Site24x7'
		|| (typeof req.headers['user-agent'] == 'string' && req.headers['user-agent'].includes('Site24x7'))
		|| req._ip == '10.135.105.69' //DO-LOAD-BALANCER
		|| req._ip == '10.135.67.247' //DO-LOAD-BALANCER
		|| req._ip == '10.135.159.134'
		|| req._ip == '10.135.159.173'
}

module.exports = {
	logger,
	isAPIChecker
};