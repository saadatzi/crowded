const express = require('express');
const app = express.Router();
const bodyParser = require('body-parser');
const NZ = require('../../utils/nz');
const {getForgotHash} = require('../../utils/cacheLayer');
const userController = require('../../controllers/user');
const agentController = require('../../controllers/admin');
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));



app.use('/interest', 	require('./interest'));
app.use('/area', 		require('./area'));
app.use('/event', 		require('./event'));
app.use('/role', 		require('./role'));
app.use('/org', 		require('./organization'));
app.use('/admin', 		require('./admin'));
app.use('/participants',require('./participants'));
app.use('/static',      require('./static'));
app.use('/setting',      require('./setting'));

app.get('/reset-password-app', (req, res) => {
    NZ.setDomainOnLocals(res);
    res.render('pages/components/reset', {
        bodyClass: 'jumbo-page'
    });
});

app.get('/reset-password-app/:token', async (req, res) => {
    NZ.setDomainOnLocals(res);
    const userId = await getForgotHash(req.params.token);

    userController.get(userId, 'id')
        .then(user => {
            if (!user) return res.send('Link expired.'); //TODO: MAKE BETTER

            res.render('pages/components/reset-form', {
                bodyClass: 'jumbo-page',
                link:      req.params.token,
                email:     user.email
            });

        })
        .catch(err => {
            console.log('!!!! user reset-password catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});

app.get('/reset-password', (req, res) => {
    NZ.setDomainOnLocals(res);
    res.render('pages/components/reset', {
        bodyClass: 'jumbo-page'
    });
});

app.get('/reset-password/:token', async (req, res) => {
    NZ.setDomainOnLocals(res);
    const userId = await getForgotHash(req.params.token);

    agentController.get(userId, 'id')
        .then(user => {
            if (!user) return res.send('Link expired.'); //TODO: MAKE BETTER

            res.render('pages/components/reset-form', {
                bodyClass: 'jumbo-page',
                link:      req.params.token,
                email:     user.email
            });

        })
        .catch(err => {
            console.log('!!!! user reset-password catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});


module.exports = app;