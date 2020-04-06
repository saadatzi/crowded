module.exports = {
	POST_app_device_auth: {
		needToken: 	false,
		isSecure:	false,
	},
	POST_app_user_register: {
		needToken: 	true,
		isSecure:	false,
	},
	POST_app_user_login: {
		needToken: 	true,
		isSecure:	false,
	},
	GET_app_user_logout: {
		needToken: 	true,
		isSecure:	true,
	},
	GET_app_interest: {
		needToken: 		true,
		isSecure:	false,
	},
	POST_app_interest: {
		needToken: 		true,
		isSecure:	false,
	},
	PUT_app_interest_add: {
		needToken: 	true,
		isSecure:	true,
	},

};