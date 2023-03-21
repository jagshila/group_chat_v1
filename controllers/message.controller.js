const { StatusCodes, successResponse, failureResponse, errorResponse } = require('../services/api.service');
const Group = require('../models/schema/group.model');
const JoinedGroups = require('../models/schema/joinedgroup.model');
const Messages = require('../models/schema/message.model');
const { ObjectId } = require('mongoose').Types;
const deletedUserMsg = {
    message: 'You are no longer member of this group.',
    from: 'sys',
    likes: 0
};

const maxMessagesInBucket = 500;
const maxRecords = 10;

const getNextPage = (lastMessageSeen, totalMessages) => {
    if (lastMessageSeen < totalMessages) {
        return Math.floor(lastMessageSeen / 10) + 1;
    } else {
        if (lastMessageSeen % 10 === 0) {
            return Math.floor(lastMessageSeen / 10);
        } else { return Math.ceil(lastMessageSeen / 10); };
    };
};

/**
 * Controller to get user messages
 * @param {any} req Express Request object
 * @param {any} res Express Response object
 */
const getUserMessages = async (req, res) => {
    let page = -1;
    try {
        if (req.query.page) {
            page = parseInt(req.query.page.toString());
            if (isNaN(page)) { page = -1; };
        }
    } catch (e) { page = -1; }

    try {
        const groupId = req.params.group_id;
        const joinedGroup = await JoinedGroups.findOne({ user_id: res.locals.userId, 'joined_groups.group_id': groupId }, { 'joined_groups.$': 1 });
        if (!joinedGroup) {
            return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Only users of the group can view messages');
        }
        let lastMessageSeen = joinedGroup.joined_groups[0].message_viewed;
        const isDeletedUser = joinedGroup.joined_groups[0].is_deleted;
        const groupData = await Group.findOne({ _id: groupId }, { message_count: 1, members: 1 });
        const totalMessages = isDeletedUser ? lastMessageSeen : groupData.message_count;
        if (page !== -1 && totalMessages > (page - 1) * maxRecords) {
            lastMessageSeen = (page - 1) * maxRecords;
        }
        page = getNextPage(lastMessageSeen, totalMessages);

        const displayNameMap = {};

        groupData.members.forEach(mem => {
            displayNameMap[mem.user_id] = mem.display_name;
        });

        const bucketId = Math.ceil(page * maxRecords / maxMessagesInBucket);
        const bucketPage = page % (maxMessagesInBucket / maxRecords);
        const skip = (bucketPage - 1) * maxRecords;
        const records = isDeletedUser ? lastMessageSeen % maxRecords : maxRecords;
        const messageData = await Messages.findOne({ group_id: groupId, bucket_id: bucketId }, { messages: { $slice: [skip, records] } });
        const messages = messageData.messages.map(msg => {
            return { ...msg._doc, display_name: displayNameMap[msg.from] };
        });

        const updatedMessageSeen = (page - 1) * maxRecords + messages.length;
        if (updatedMessageSeen > joinedGroup.joined_groups[0].message_viewed) {
            await JoinedGroups.updateOne({ user_id: res.locals.userId, 'joined_groups.group_id': groupId },
                { $set: { 'joined_groups.$.message_viewed': updatedMessageSeen } });
        }
        if (isDeletedUser) { messages.push(deletedUserMsg); }
        const pagination = {
            prev: page === 1 ? '' : `/groups/${groupId}/messages?page=${page - 1}`,
            next: page * maxRecords < totalMessages ? `/groups/${groupId}/messages?page=${page + 1}` : ''
        };

        successResponse(res, StatusCodes.OK, { messages, pagination }, 'Messages fetched successfully');
    } catch (e) {
        errorResponse(res, e, 'Error fetching data');
    }
};

const addUserMessage = async (req, res) => {
    try {
        const groupId = req.params.group_id;
        const data = req.body;
        const joinedGroup = await JoinedGroups.exists({ user_id: res.locals.userId, 'joined_groups.group_id': groupId, 'joined_groups.is_deleted': false });
        if (!joinedGroup) {
            return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Only users of the group can send messages');
        }

        const group = await Group.findOneAndUpdate({ _id: new ObjectId(groupId), id_deleted: false }, { $inc: { message_count: 1 } }, { new: true, projection: { message_count: 1 } });

        if (!group) { return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Deleted group'); }

        const bucketId = Math.floor(group.message_count / maxMessagesInBucket) + 1;
        await Messages.updateOne({ group_id: groupId, bucket_id: bucketId },
            {
                $inc: { message_count: 1 },
                $push: {
                    messages: {
                        message: data.message,
                        from: res.locals.userId
                    }
                }
            }, { upsert: true });

        successResponse(res, StatusCodes.OK, {}, 'Message added successfully');
    } catch (e) {
        errorResponse(res, e, 'Error updating data');
    }
};

const addMessageLike = async (req, res) => {
    try {
        const groupId = req.params.group_id;
        const messageId = req.params.message_id;
        const joinedGroup = await JoinedGroups.exists({ user_id: res.locals.userId, 'joined_groups.group_id': groupId, 'joined_groups.is_deleted': false });
        if (!joinedGroup) {
            return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Only users of the group can like messages');
        }

        const updated = await Messages.updateOne({ group_id: groupId, 'messages._id': new ObjectId(messageId) },
            {
                $inc: { 'messages.$.likes': 1 }
            });

        if (updated.modifiedCount) {
            return successResponse(res, StatusCodes.OK, {}, 'Message liked successfully');
        } else {
            return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Message not found in this group');
        }
    } catch (e) {
        errorResponse(res, e, 'Error updating data');
    }
};

module.exports = {
    getUserMessages,
    addUserMessage,
    addMessageLike
};
