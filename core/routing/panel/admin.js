const express = require('express')
    , router = express.Router();

// Instantiate the Device Model
const adminController = require('../../controllers/admin');
const roleController = require('../../controllers/role');
const userController = require('../../controllers/user');
const NZ = require('../../utils/nz');
const {sign, verifyTokenPanel, authorization} = require('../../utils/validation');

const Joi = require('@hapi/joi');
const JoiConfigs = require('./../joiConfigs');
const {joiValidate,grabSettings} = require('./../utils');

const settings = require('../../utils/settings');

const controllerUtils = require('../../controllers/utils');


const Event = require('../../models/Event');

const {getHash} = require('../../utils/cacheLayer')

const callSchema = Joi.object().keys({
    callType: JoiConfigs.title,
    value: JoiConfigs.title,
});

const addSchema = Joi.object().keys({
    email: JoiConfigs.email(),
    name: JoiConfigs.title,
    password: JoiConfigs.password,
    roles: JoiConfigs.arrayLength(1, 50, JoiConfigs.isMongoId),
    call: JoiConfigs.array(false, callSchema),
    organizationId: JoiConfigs.isMongoId
});


const updateSchema = Joi.object().keys({
    adminId: JoiConfigs.isMongoId,
    name: JoiConfigs.strOptional,
    roles: JoiConfigs.array(false, JoiConfigs.isMongoId),
    call: JoiConfigs.array(false, callSchema),
    organizationId: JoiConfigs.isMongoIdOpt,
    password: JoiConfigs.passwordOpt,
    oldPassword: JoiConfigs.passwordOpt,
}).required().with('password', 'oldPassword');

const hasValidIdSchema = Joi.object().keys({
    id: JoiConfigs.isMongoId
});


const loginSchema = Joi.object().keys({
    email: JoiConfigs.email(),
    password: JoiConfigs.password,
});

const claimResetPasswordSchema = Joi.object().keys({
    email: JoiConfigs.email(true),
});

const verifyResetPasswordSchema = Joi.object().keys({
    hash: JoiConfigs.title //TODO: secure validate hash
});


const useResetPasswordSchema = Joi.object().keys({
    hash: JoiConfigs.title, //TODO: secure validate hash
    password: JoiConfigs.password,
    passwordConfirm: Joi.ref('password')
});


const listSchema = JoiConfigs.schemas.list({
    filters: {
        status: Joi.number().valid(0, 1, 2),
    },
    sorts: {
        createdAt: Joi.number().valid(-1, 1),
    },
    defaultSorts: {
        createdAt: -1
    }
});


const activateSchema = Joi.object().keys({
    adminId: JoiConfigs.isMongoId,
    isActive: JoiConfigs.boolInt,
});

/**
 *  login Panel
 */
//______________________Login Panel_____________________//
router.post('/login', joiValidate(loginSchema), async (req, res) => {
    console.info('API: Login Panel User/init %j', {body: req.body});

    adminController.auth(req.body.email, req.body.password)
        .then(async user => {
            await roleController.getAdmin(user.roles)
                .then(permissions => {
                    delete user.roles;
                    const token = sign({userId: user.id});
                    new NZ.Response({user, token, permissions}).send(res);
                })
                .catch(err => {
                    console.log('!!!! user login Panel getAdminPermissions catch err: ', err);
                    new NZ.Response(null, err.message, err.code || 500).send(res);
                });
        })
        .catch(err => {
            console.log('!!!! user login Panel catch err: ', err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        });
});

/**
 *  logout Panel
 */
//______________________Logout_____________________//
router.get('/logout', verifyTokenPanel(), async (req, res) => {
    console.info('API: logout Panel User/init');
    // const newToken = sign({deviceId: req.deviceId});
    //TODO redis Token blackList
    new NZ.Response(true).send(res);

});


/**
 *  Add Admin
 * -add Admin in db
 * @return status 5e9fa191c12938e496a23480
 */
//______________________Add Admin_____________________//
router.post('/add', joiValidate(addSchema), verifyTokenPanel(), authorization([{ADMIN: 'C'}]), async (req, res) => {
    console.info('API: Add Admin/init %j', {body: req.body});

    adminController.add(req.body)
        .then(admin => {
            new NZ.Response(true, 'Admin has been successfully added!').send(res);
        })
        .catch(err => {
            console.error("Admin Add Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Update Admin
 * -update Admin in db
 * @return status
 */
//______________________Update Admin_____________________//
router.put('/edit', joiValidate(updateSchema), verifyTokenPanel(), authorization([{ADMIN: 'RU'}]), async (req, res) => {
    console.info('API: update Admin/init %j', {body: req.body});

    const adminId = req.body.adminId;
    delete req.body.adminId;
    //Compare old password
    let passwordIsMatch = true;
    if (req.body.password) {
        passwordIsMatch = await adminController.get(adminId, 'id')
            .then(async admin => {
                if (!admin) return new NZ.Response(false, 'Not found!', 404).send(res);
                return await admin.comparePassword(req.body.oldPassword)
                    .then(isMatch => {
                        if (!isMatch) new NZ.Response(false, 'Your old password & current is not match!', 400).send(res);
                        delete req.body.oldPassword;
                        return isMatch;
                    })
                    .catch(err => {
                        console.error("Admin comparePassword Catch err:", err);
                        return new NZ.Response(null, err.message, err.code || 500).send(res);
                    });
            })
            .catch(err => {
                console.error("Admin get for check pass err:", err);
                return new NZ.Response(null, err.message, err.code || 500).send(res);
            })
    }
    if (passwordIsMatch) {
        adminController.update(adminId, req.body)
            .then(admin => {
                new NZ.Response(true, admin ? 'Admin has been successfully update!' : 'Not found!', admin ? 200 : 404).send(res);
            })
            .catch(err => {
                console.error("Admin update Catch err:", err);
                new NZ.Response(null, err.message, err.code || 500).send(res);
            })
    }
});


/**
 *  Activation ADMIN
 * -UPDATE Admin status in db
 * @return status
 */
//______________________Add Event_____________________//
router.put('/activate', joiValidate(activateSchema), verifyTokenPanel(), authorization([{ADMIN: 'RU'}]), async (req, res) => {
    console.info('API: Activation Admin/init %j', {body: req.body});

    adminController.update(req.body.adminId, {status: req.body.isActive})
        .then(admin => {
            const resultMessage = req.body.isActive ? 'Admin Activation successful!' : 'Admin Deactivation successful!';
            new NZ.Response(!!admin, admin ? resultMessage : 'Not Found!', admin ? 200 : 404).send(res);
        })
        .catch(err => {
            console.error("Admin Activation Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});


/**
 *  List Admins
 */
router.post('/', verifyTokenPanel(), grabSettings(), joiValidate(listSchema), authorization([{ADMIN: 'R'}]), async (req, res) => {
    console.info('API: List Admin/init %j', {body: req._body});

    adminController.getManyPanel(req._body)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("List Admin Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 *  Admin Detail
 */
router.get('/:id', verifyTokenPanel(), authorization([{ADMIN: 'R'}]), async (req, res) => {
    console.info('API:  Admin Detail/init %j', {params: req.params});

    adminController.getOnePanel(req.params.id)
        .then(result => {
            new NZ.Response(result).send(res);
        })
        .catch(err => {
            console.error("Admin Detail Catch err:", err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        })
});

/**
 * Remove Admin
 */
router.delete('/', verifyTokenPanel(), joiValidate(hasValidIdSchema), authorization([{ADMIN: 'D'}]), async (req, res) => {

    let id = req.body.id;

    // await check events
    let flag = await Event.adminIsRelated(id);


    if (flag) {
        return new NZ.Response(null, "Couldn`t remove the Admin due to its relation to other collections", 400).send(res);
    } else {
        adminController.remove(id)
            .then(result => {
                new NZ.Response(null, "Admin removed successfully.").send(res);
            })
            .catch(err => {
                new NZ.Response(null, err.message, 500).send(res);
            });
    }
});


/**
 *  Request a password reset link
 */
//______________________Forgot Password_____________________//
router.post('/resetPassword/claim', joiValidate(claimResetPasswordSchema), async (req, res) => {
    console.info('API: Forgot Password Admin/init %j', {body: req.body});

    adminController.get(req.body.email, 'email')
        .then(async admin => {
            if (!admin) return new NZ.Response(false, `${req.body.email} is not valid email!`, 404).send(res);

            let email = '';
            const hash = await controllerUtils.createResetPasswordHash(admin.id);
            await controllerUtils.sendEmail(req.body.email, 'Reset Password', 'resetPassword', {
                name: admin.name,
                logo: settings.email_logo,
                cdn_domain: settings.cdn_domain,
                primary_domain: settings.primary_domain,
                contact_email: settings.contact.email,
                contact_phone: settings.contact.phone,
                contact_address: settings.contact.address,
                contact_copy: settings.contact.copyright,
                contact_project: settings.project_name,
                contact_privacy: settings.contact.privacy,
                contact_terms: settings.contact.terms,
                link: `${settings.base_panel_route}reset-password-panel/${hash}`
            });
            email = 'Email has been sent.';
            return new NZ.Response(true, `Reset-password link generated! ${email}`).send(res);


        })
        .catch(err => {
            console.log('!!!! admin forgot catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});


/**
 *  reset Password verify hash
 * check if the given hash if valid and points to a user
 */
router.post('/resetPassword/verify', joiValidate(verifyResetPasswordSchema), async (req, res) => {
    return getHash(req.body.hash)
        .then(adminId => {
            console.log('')
            return adminController.get(adminId, 'id')
        })
        .then(admin => {
            if (!admin) return new NZ.Response(null, 'Hash Invalid, Try resetting again...', 400).send(res);
            // else
            return new NZ.Response(true, 'Good to go!').send(res);

        })
        .catch(err => {
            console.log('!!!! admin login catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});


/**
 *  reset Password use hash
 *  check hash, reset the password
 */
router.post('/resetPassword/use', joiValidate(useResetPasswordSchema), async (req, res) => {

    return getHash(req.body.hash, true)
        .then(adminId => {
            return adminController.get(adminId, 'id')
        })
        .then(admin => {
            if (!admin) return new NZ.Response(null, 'Hash Invalid, Try resetting again...', 400).send(res);
            // else
            // !!! update password !!!
            admin.password = req.body.password;
            return admin.save();
        })
        .then(admin => {
            return new NZ.Response(true, 'OK.').send(res);
        })
        .catch(err => {
            console.log('!!!! admin login catch err: ', err);
            new NZ.Response(null, err.message, err.code || 500).send(res);
        });
});

// router.post('/resetPassword/use', joiValidate(useResetPasswordSchema), async (req, res) => {
//     let adminDTO;

//     return getHash(req.body.hash,true)
//         .then(adminId => {
//             return adminController.get(adminId, 'id')
//         })
//         .then(admin => {
//             if (!admin) return new NZ.Response(null, 'Hash Invalid, Try resetting again...', 400).send(res);
//             // else
//             // !!! update password !!!
//             admin.password = req.body.password;
//             return admin.save();
//         })
//         .then(admin => {
//             return adminController.auth(admin.email, req.body.password)
//         })
//         .then(admin => {
//             adminDTO = admin;
//             return roleController.getAdmin(admin.roles)
//         })
//         .then(permissions => {
//             delete adminDTO.roles;
//             const token = sign({userId: adminDTO.id});
//             new NZ.Response({user: adminDTO, token, permissions}).send(res);
//         })
//         .catch(err => {
//             console.log('!!!! admin login catch err: ', err);
//             new NZ.Response(null, err.message, err.code || 500).send(res);
//         });
// });

/*App Reset Password*/
/**
 * App reset Password verify hash
 * check if the given hash if valid and points to a user
 */
router.post('/user/resetPassword/verify', joiValidate(verifyResetPasswordSchema, 0), async (req, res) => {
    return getHash(req.body.hash)
        .then(userId => {
            return userController.get(userId, 'id')
        })
        .then(user => {
            if (!user) return new NZ.Response(null, 'Hash Invalid, Try resetting again...', 400).send(res);
            // else
            return new NZ.Response(true, 'Good to go!').send(res);

        })
        .catch(err => {
            console.log('!!!! user verify hash catch err: ', err);
            new NZ.Response(null, err.message, 400).send(res);
        });
});


/**
 *  App reset Password use hash
 *  check hash, reset the password
 */
router.post('/user/resetPassword/use', joiValidate(useResetPasswordSchema), async (req, res) => {

    try {
        let userId = await getHash(req.body.hash, true);
        let user = await userController.get(userId, 'id')
        if (!user) return new NZ.Response(null, 'Hash Invalid, Try resetting again...', 400).send(res);
        // else
        // !!! update password !!!
        user.password = NZ.sha512Hmac(req.body.password, user.salt);
        await user.save();
        return new NZ.Response(true, 'OK.').send(res);
    } catch (err) {
        console.log('!!!! user use hash catch err: ', err);
        new NZ.Response(null, err.message, 400).send(res);
    }
});


module.exports = router;
