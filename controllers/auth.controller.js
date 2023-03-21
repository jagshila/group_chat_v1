const User = require('../models/schema/user.model');
const { checkType } = require('../helpers/checkType');
const md5 = require('md5');
const { failureResponse, StatusCodes, successResponse } = require('../services/api.service');
const { createToken } = require('../models/jwt.model');

const getAuthToken = async (req, res) => {
    const data = req.body;
    const checkObj = [
        { name: 'user_name', type: 'string', required: true },
        { name: 'password', type: 'string', required: true }
    ];

    if (!checkType(data, checkObj, res)) { return; };

    try {
        const userData = await User.findOne({ user_name: data.user_name }, { password: 1, is_admin: 1, change_password: 1 });
        if (!userData) {
            return failureResponse(res, StatusCodes.NOT_FOUND, {}, `User with user_name: ${data.user_name} not found!`);
        }
        if (userData.password === md5(data.password)) {
            const token = createToken(userData._id, userData.is_admin);
            res.cookie('token', token, { httpOnly: true, secure: process.env.LOCAL !== 'true' });
            if (userData.change_password) {
                let data = {};
                if (process.env.NODE_ENV === 'test') { data = { test_token: token }; };
                successResponse(res, StatusCodes.OK, data, 'Authentication success!, Please update your password');
            } else { successResponse(res, StatusCodes.OK, {}, 'Authentication success!'); }
        } else {
            failureResponse(res, StatusCodes.UNAUTHORIZED, {}, 'Authentication failure. Incorrect password.');
        }
    } catch (e) {
        console.log(e);
        failureResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {}, 'Error inserting data');
    }
};

const logout = (req, res) => {
    res.cookie('token', { expires: Date.now() });
    successResponse(res, StatusCodes.OK, {}, 'Logout success');
};

module.exports = {
    getAuthToken,
    logout
};
