const { unauthorized } = require('../services/api.service');
const Auth = require('./auth');
/**
 * Middleware to check admin auth
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 * @param {any} next Express next function
 */
module.exports = (req, res, next) => {
    Auth(req, res, () => {
        if (res.locals.admin) {
            next();
        } else {
            unauthorized(res, 'Admin access not authorized');
        }
    });
};
