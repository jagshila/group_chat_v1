const Group = require('../models/schema/group.model');
const User = require('../models/schema/user.model');
const JoinedGroups = require('../models/schema/joinedgroup.model');
const { ObjectId } = require('mongoose').Types;
const { StatusCodes, successResponse, failureResponse, errorResponse } = require('../services/api.service');
const { checkType } = require('../helpers/checkType');

/**
 * Controller to get group data
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const getGroup = async (req, res) => {
    try {
        const group = await Group.findOne({ _id: req.params.id }, { members: 0 });
        if (group) {
            successResponse(res, StatusCodes.OK, group);
        } else {
            failureResponse(res, StatusCodes.NOT_FOUND, {}, 'Specified group data not found');
        }
    } catch (e) {
        errorResponse(res, e, 'Error fetching data');
    }
};

/**
 * Controller to get user groups
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const getGroups = async (req, res) => {
    try {
        const joinedGroups = await JoinedGroups.findOne({ user_id: res.locals.userId }, { joined_groups: 1 });
        const groupIds = [];
        joinedGroups.joined_groups.forEach(g => {
            if (!g.is_deleted) {
                groupIds.push(g.group_id);
            }
        }
        );
        const groups = await Group.find({ _id: { $in: groupIds } }, { members: 0 });

        successResponse(res, StatusCodes.OK, { groups }, 'Groups fetched successfully');
    } catch (e) {
        errorResponse(res, e, 'Error fetching data');
    }
};

/**
 * Controller to create new group (group_name, description)
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const createGroup = async (req, res) => {
    const data = req.body;
    const checkObj = [
        { name: 'group_name', type: 'string', required: true },
        { name: 'description', type: 'string', required: false }
    ];
    if (!checkType(data, checkObj, res)) { return; };

    try {
        const user = await User.findOne({ _id: res.locals.userId });
        const group = new Group({
            group_name: data.group_name,
            description: data.description,
            members: [{ user_id: res.locals.userId, admin: true, owner: true, display_name: user.display_name }],
            message_count: 0
        });
        const newGroup = await group.save();
        await JoinedGroups.updateOne({ user_id: res.locals.userId }, {
            $push: { joined_groups: { message_viewed: 0, group_id: newGroup._id } }
        }, { upsert: true });
        successResponse(res, StatusCodes.CREATED, { group_name: newGroup.group_name, group_id: newGroup._id },
            `Group: ${newGroup.group_name} created successfully`);
    } catch (e) {
        errorResponse(res, e, 'Error inserting data');
    }
};

/**
 * Controller to update group data (group_name, description)
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const updateGroup = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try {
        const allowed = await JoinedGroups.exists({
            user_id: res.locals.userId,
            'joined_groups.group_id': id
        });
        if (allowed || res.locals.admin) {
            const checkObj = [
                { name: 'group_name', type: 'string', required: false },
                { name: 'description', type: 'string', required: false }
            ];
            if (!checkType(data, checkObj, res)) { return; };
            const dataToUpdate = {};
            if (data.group_name) { dataToUpdate.group_name = data.group_name; }
            if (data.description) { dataToUpdate.description = data.description; }
            const result = await Group.updateOne({ _id: id }, dataToUpdate);
            if (result.matchedCount) {
                if (result.modifiedCount) {
                    successResponse(res, StatusCodes.OK, {}, 'Group details updated successfully');
                } else { successResponse(res, StatusCodes.OK, {}, 'Nothing to modify'); };
            } else {
                failureResponse(res, StatusCodes.NOT_FOUND, {}, `Group with id: ${id} not found`);
            }
        } else {
            failureResponse(res, StatusCodes.FORBIDDEN, {}, 'You donot have access to update this group');
        }
    } catch (e) {
        errorResponse(res, e, 'Error updating data');
    }
};

const deleteGroup = async (req, res) => {
    const id = req.params.id;
    try {
        const allowed = await Group.exists({
            _id: id,
            'members.user_id': res.locals.userId,
            'members.admin': true,
            'members.is_deleted': false
        });
        if (allowed || res.locals.admin) {
            const result = await Group.updateOne({ _id: id }, { is_deleted: true });
            if (result.matchedCount) {
                if (result.modifiedCount) {
                    successResponse(res, StatusCodes.OK, {}, 'Group deleted successfully');
                } else { successResponse(res, StatusCodes.OK, {}, 'Nothing to modify'); };
            } else {
                failureResponse(res, StatusCodes.NOT_FOUND, {}, `Group with id: ${id} not found`);
            }
        } else {
            failureResponse(res, StatusCodes.FORBIDDEN, {}, 'You donot have access to delete this group');
        }
    } catch (e) {
        errorResponse(res, e, 'Error updating data');
    }
};

/**
 * Controller to get all users
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const getGroupMembers = async (req, res) => {
    const maxRecords = 10;
    const id = req.params.id;
    let page = 1;
    try {
        if (req.query.page) {
            page = parseInt(req.query.page.toString());
            if (isNaN(page)) { page = 1; };
        }
    } catch (e) { page = 1; }
    try {
        const memberData = await Group.findOne({ _id: id }, { members: { $slice: [(page - 1) * maxRecords, maxRecords + 1] } });
        const members = memberData.members;
        const pagination = {
            prev: page === 1 ? '' : `/groups/:${id}/members?page=${page - 1}`,
            next: members.length > maxRecords ? `/groups/:${id}/members?page=${page + 1}` : ''
        };
        successResponse(res, StatusCodes.OK, { members: members.slice(0, maxRecords).filter(m => !m.is_deleted), pagination }, 'Members fetched successfully');
    } catch (e) {
        errorResponse(res, e, 'Error fetching data');
    }
};

const addGroupMember = async (req, res) => {
    try {
        const userId = req.params.member_id;
        const groupId = req.params.id;

        if (!res.locals.admin) {
            const memberOfGroup = await JoinedGroups.exists({ user_id: res.locals.userId, 'joined_groups.group_id': groupId });
            if (!memberOfGroup) {
                return failureResponse(res, StatusCodes.NOT_FOUND, {}, 'Only members can add user to group');
            }
        }

        const user = await User.findOne({ _id: userId }, { display_name: 1 });

        if (!user) {
            return failureResponse(res, StatusCodes.NOT_FOUND, {}, `User with id: ${userId} not found`);
        }
        const group = await Group.findOne({ _id: new ObjectId(groupId), id_deleted: false }, { message_count: 1 });
        if (!group) {
            return failureResponse(res, StatusCodes.NOT_FOUND, {}, `Group with id: ${groupId} not found`);
        }
        const alreadyJoined = await JoinedGroups.findOne({ user_id: userId, 'joined_groups.group_id': groupId }, { 'joined_groups.$': 1 });
        if (alreadyJoined) {
            if (alreadyJoined.joined_groups[0].is_deleted === true) {
                await Group.updateOne({ _id: groupId, 'members.user_id': userId }, {
                    $set: {
                        'members.$.is_deleted': false
                    }
                });

                await JoinedGroups.updateOne({ user_id: userId, 'joined_groups.group_id': groupId }, {
                    $set: {
                        'joined_groups.$.is_deleted': false
                    }
                });
                return successResponse(res, StatusCodes.OK, {}, 'User successfully added to group');
            } else { return failureResponse(res, StatusCodes.BAD_REQUEST, {}, `User with id: ${userId} already present in group id: ${groupId}`); }
        }

        await Group.updateOne({ _id: groupId }, {
            $push:
            {
                members: {
                    user_id: userId,
                    display_name: user.display_name,
                    admin: !!req.body.admin
                }
            }
        });

        await JoinedGroups.updateOne({ user_id: userId }, {
            $push:
            {
                joined_groups: {
                    group_id: groupId,
                    message_viewed: group.message_count
                }
            }
        }, { upsert: true });

        successResponse(res, StatusCodes.OK, {}, 'User successfully added to group');
    } catch (e) {
        errorResponse(res, e, 'Error inserting data');
    }
};

const updateMemberRights = async (req, res) => {
    const id = req.params.id;
    const memberId = req.params.member_id;
    try {
        const allowed = await Group.exists({
            _id: id,
            'members.user_id': res.locals.userId,
            'members.admin': true,
            'members.is_deleted': false
        });
        if (allowed || res.locals.admin) {
            const result = await Group.updateOne({ _id: id, 'members.user_id': memberId }, {
                $set: {
                    'members.$.admin': !!req.body.admin
                }
            });
            if (result.matchedCount) {
                if (result.modifiedCount) {
                    successResponse(res, StatusCodes.OK, {}, 'Member rights updated successfully');
                } else { successResponse(res, StatusCodes.OK, {}, 'Nothing to modify'); };
            } else {
                failureResponse(res, StatusCodes.NOT_FOUND, {}, `User with id: ${memberId} not found in group`);
            }
        } else {
            failureResponse(res, StatusCodes.FORBIDDEN, {}, 'You donot have access to delete this group');
        }
    } catch (e) {
        errorResponse(res, e, 'Error updating data');
    }
};

const removeGroupMember = async (req, res) => {
    const id = req.params.id;
    const memberId = req.params.member_id;
    try {
        const allowed = await Group.exists({
            _id: id,
            'members.user_id': res.locals.userId,
            'members.admin': true,
            'members.is_deleted': false
        });
        if (allowed || res.locals.admin) {
            const result = await Group.updateOne({ _id: id, 'members.user_id': memberId }, {
                $set: {
                    'members.$.is_deleted': true
                }
            });

            await JoinedGroups.updateOne({ user_id: memberId, 'joined_groups.group_id': id }, {
                $set: {
                    'joined_groups.$.is_deleted': true
                }
            });

            if (result.matchedCount) {
                if (result.modifiedCount) {
                    successResponse(res, StatusCodes.OK, {}, 'Member removed successfully');
                } else { successResponse(res, StatusCodes.OK, {}, 'Nothing to modify'); };
            } else {
                failureResponse(res, StatusCodes.NOT_FOUND, {}, `User with id: ${memberId} not found in group`);
            }
        } else {
            failureResponse(res, StatusCodes.FORBIDDEN, {}, 'You donot have access to remove user from this group');
        }
    } catch (e) {
        errorResponse(res, e, 'Error updating data');
    }
};

module.exports = {
    getGroup,
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addGroupMember,
    updateMemberRights,
    removeGroupMember
};
