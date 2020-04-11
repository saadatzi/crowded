const path = require('path');
module.exports = {
	contact:		{
		email:		'info@kidsapp.com',
		phone:		'+965 9744 8984',
		address:	'KIDS Technologies CO. <br> MSSS Alddd Complex, <br> Kuwait City',
		copyright:	'Kids Inc.',
		privacy:	'https://google.com',
		terms:		'https://google.com',
	},

	serverConfig: {
		host: "127.0.0.1",
		port: 7770,
		productPort: 4001,
		SN: "/cr198"
	},

	mongoDB: {
		host: "127.0.0.1",
		port: 27017,
		dbName: 'crowded',
		user: 'root',
		pass: 'BAp3kTJGu9H-2+N'
	},

	mail: {
		host:      'smtp.gmail.com',
		port:      587,
		username:  'automated@nizek.com',
		password:  '@nizek123456_',
		from:      'kidsapp@nizek.com',
		from_name: 'Kids App'
	},

	redis: 			{
		password: 	'd2f3db53e64ffddcfdf5c0f2cd36f95517356e9b',
		host:		'localhost',
		port:		6379,
		expire: 	60000 * 60
	},

	memoryLocalCache: {
		maxSize: 100,
	},

	event: {
		maxImageForEvent: 7,
		limitPage: 4
	},

	hashids_seed:	"cc679a61iipahn2u4ged2df11",
	hashids_max:	3,

	api_domain:		'https://api.kids.dev.nizek.com/',
	cdn_domain:		'https://media.kids.dev.nizek.com/',
	primary_domain:	'https://kids.dev.nizek.com/',
	project_name:	'Kids',

	panel_route:	'',
	api_base:		'https://api.crowded.dev.nizek.com/',
	media_domain:	'https://media.crowded.dev.nizek.com/',



	HASH_key1:		"XWI2EFNCXLhAd9vrmjUQnOjEsJ2xvY2H5B",
	HASH_key2:		"3ChQljCWLVmzzNCwnY2F0ZWdvcnlJRCc6LhAd9vrmjHlwZSc6InZI",

	propic_folder: 'pp13i74x/',
	temp_folder:   '_temp/',
	media_folder:   'crowded-media/',
	// media_path:    path.join(process.env.PWD, '../crowded-media/'),
	media_path:    path.join(path.dirname(require.main.filename), '../../crowded-media/'),



	email_logo:		'https://media.kids.dev.nizek.com/_email/Kidadvisor-white.png',

	db_date_format: 	'YYYY-MM-DD HH:mm:ss',
	date_format:		'DD-MM-YYYY',
	time_format:		'HH:mm',

	'NizekUtils.Localizations.Dump.Enabled':   true,
	'NizekUtils.Localizations.Dump.Interval':  60,
	'NizekUtils.Localizations.Fetch.Interval': 300,



	google_login: {
		ios:     '317747001343-3pi7f259tv9h24qla9d67kjts6bn85gh.apps.googleusercontent.com',
		android: '317747001343-tthjsd5b0bs8tt1lo1lm8buo0h1o56cg.apps.googleusercontent.com',
		adnroid_debug: '317747001343-f4309nthjktfftj4iurpob6n2gmqvm50.apps.googleusercontent.com'
	},

	facebook_login: {
		secret:		'14f8f8d7aca68358eddb4179777d87ae',
		client_id:	'408352710035595',
	},

	tap_secret: 'sk_test_XKokBfNWv6FIYuTMg5sLPjhJ',

	pagination: {
		class: 2,
		search: 2
	},
}