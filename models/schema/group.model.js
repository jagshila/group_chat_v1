const { Schema, model } = require('mongoose');

const MemberSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Boolean,
        required: true,
        default: false
    },
    display_name: {
        type: String,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
});

const GroupSchema = new Schema({
    group_name: {
        type: String,
        required: true
    },
    members: {
        type: [MemberSchema],
        required: true
    },
    description: {
        type: String
    },
    message_count: {
        type: Number,
        default: 0
    },
    id_deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, collection: 'groups' });

module.exports = model('Group', GroupSchema);
