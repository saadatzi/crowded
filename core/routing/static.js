const express = require('express');
const app = express.Router();

const settings = require('../utils/settings');
const staticController = require('../controllers/static');

app.get('/:lang/:alias/', async (req, res, next) => {

	const page = await staticController.getByAlias(req.params.alias);
	if (!page) return next();

	const html = {
		title:	 req.params.lang == 'ar' ? page.name_ar : page.name_en,
		content: req.params.lang == 'ar' ? page.html_ar : page.html_en,
	};

	res.render('static_page', {
		project_name:	settings.project_name,
		title:			html.title,
		content:		html.content,
	});
});

/**
 * Get Wallet Chart
 * @return Chart html
 */
//______________________Get Wallet_____________________//
app.get('/myWalletChart/:hash', async function (req, res) {
	console.info('API: Get appMyWalletChart/init userId:', req.params.hash);

	res.render('my_wallet_chart', {
		project_name:	settings.project_name,
		title:			'My wallet Chart',
		content:		'',
	});
});

module.exports = app;