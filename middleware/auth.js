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
        let token = '';
        if (process.env.NODE_ENV === 'test') {
            token = req.headers.test_token;
        } else { token = req.cookies.token; }
        // const token = req.cookies.token;
        if (token === '') {
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
    } catch (e) {
        unauthorized(res, 'Invalid request');
    }
};
