const User = require('../models/schema/user.model');
const md5 = require('md5');
const { StatusCodes, successResponse, failureResponse, errorResponse } = require('../services/api.service');
const { checkType } = require('../helpers/checkType');

/**
 * Controller to get user data
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const getUser = async (req, res) => {
    try {
        const projections = { password: 0 };
        const user = await User.findOne({ _id: req.params.id }, projections);
        if (user) {
            successResponse(res, StatusCodes.OK, user);
        } else {
            failureResponse(res, StatusCodes.NOT_FOUND, {}, 'Specified user data not found');
        }
    } catch (e) {
        errorResponse(res, e, 'Error fetching data');
    }
};

/**
 * Controller to get all users
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const getUsers = async (req, res) => {
    const maxRecords = 10;
    let page = 1;
    try {
        if (req.query.page) {
            page = parseInt(req.query.page.toString());
            if (isNaN(page)) { page = 1; };
        }
    } catch (e) { page = 1; }
    try {
        const search = req.query.search ? req.query.search : '';
        const query = { $regex: new RegExp(search), $options: 'i' };// ;

        // const users = await User.find({ $text: { $search: query } },
        //     { score: { $meta: 'textScore' }, display_name: 1, user_name: 1 })
        //     .sort({ created_data: 1, score: 1 }).skip((page - 1) * maxRecords).limit(maxRecords + 1);

        const users = await User.find({ $or: [{ user_name: query }, { display_name: query }] }, { password: 0, change_password: 0 })
            .skip((page - 1) * maxRecords).limit(maxRecords + 1);
        const pagination = {
            prev: page === 1 ? '' : `/users?page=${page - 1}`,
            next: users.length > maxRecords ? `/users?page=${page + 1}` : ''
        };
        successResponse(res, StatusCodes.OK, { users: users.slice(0, maxRecords), pagination }, 'Users fetched successfully');
    } catch (e) {
        errorResponse(res, e, 'Error fetching data');
    }
};

/**
 * Controller to create new user
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const createUser = async (req, res) => {
    const data = req.body;
    const checkObj = [
        { name: 'user_name', type: 'string', required: true },
        { name: 'password', type: 'string', required: true },
        { name: 'display_name', type: 'string', required: false },
        { name: 'is_admin', type: 'boolean', required: false }];
    if (!checkType(data, checkObj, res)) { return; };

    try {
        if (data.user_name === 'sys') { return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Username sys not allowed!'); }

        const user = new User({
            user_name: data.user_name,
            display_name: data.display_name ? data.display_name : data.user_name,
            password: md5(data.password),
            is_admin: !!data.is_admin
        });
        const newUser = await user.save();
        successResponse(res, StatusCodes.CREATED, { user_name: newUser.user_name, user_id: newUser._id },
            `User with user_name: ${newUser.user_name} created successfully`);
    } catch (e) {
        errorResponse(res, e, 'Error inserting data');
    }
};

/**
 * Controller to update user data
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const updateUser = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        if (id === res.locals.userId || res.locals.admin) {
            const checkObj = [
                { name: 'password', type: 'string', required: false },
                { name: 'display_name', type: 'string', required: false },
                { name: 'bio', type: 'string', required: false },
                { name: 'user_image', type: 'string', required: false },
                { name: 'is_admin', type: 'boolean', required: false }];
            if (!checkType(data, checkObj, res)) { return; };
            const dataToUpdate = {};
            if (data.display_name) { dataToUpdate.display_name = data.display_name; }
            if (data.password) {
                dataToUpdate.password = md5(data.password);
                dataToUpdate.change_password = false;
            }
            if (data.bio) { dataToUpdate.bio = data.bio; }
            if (data.user_image) { dataToUpdate.user_image = data.user_image; }
            if (res.locals.admin && data.is_admin) { dataToUpdate.is_admin = data.is_admin; }
            const result = await User.updateOne({ _id: id }, dataToUpdate);

            if (result.matchedCount) {
                if (result.modifiedCount) {
                    successResponse(res, StatusCodes.OK, {}, 'User details updated successfully');
                } else { successResponse(res, StatusCodes.OK, {}, 'Nothing to modify'); };
            } else {
                failureResponse(res, StatusCodes.NOT_FOUND, {}, `User with id: ${id} not found`);
            }
        } else {
            failureResponse(res, StatusCodes.FORBIDDEN, {}, 'User update access denied');
        }
    } catch (e) {
        errorResponse(res, e, 'Error updating data');
    }
};

module.exports = {
    getUser,
    getUsers,
    createUser,
    updateUser
};
