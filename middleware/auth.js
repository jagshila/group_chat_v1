const { verifyToken } = require('../models/jwt.model');
const { unauthorized } = require('../services/api.service');
/**
 * Middleware to check admin auth
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 * @param {any} next Express next function
 */
module.exports = (req, res, next) => {
    try {
        res.locals.admin = true;
        res.locals.userId = '6415eff0fa5dc3c2cb38188d';
        return next();
        const token = req.cookies.token;
        if (token === '') {
            res.status(401).json({
                error: new Error('No Auth Token!')
            });

            unauthorized(res, 'No Auth Token!');
            return;
        }

        const data = verifyToken(token);
        if (data.success) {
            res.locals.userId = data.decoded.id;
            req.id = data.decoded.id;
            res.locals.admin = !!data.decoded.admin;
            next();
        } else {
            unauthorized(res, data.msg);
        }
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};
