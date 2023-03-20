const { Schema, model } = require('mongoose');

const GroupInfoSchema = new Schema({
    group_id: {
        type: String,
        required: true
    },
    message_viewed: {
        type: Number,
        default: 0
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
});

const JoinedGroupSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    joined_groups: {
        type: [GroupInfoSchema]
    }
}, { timestamps: true, collection: 'joined_groups' });

module.exports = model('JoinedGroups', JoinedGroupSchema);
