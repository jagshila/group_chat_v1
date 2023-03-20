const { Schema, model } = require('mongoose');

const MessageSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    }
});

const MessageBucketSchema = new Schema(
    {
        group_id: {
            type: String,
            required: true
        },
        messages: {
            type: [MessageSchema],
            required: true
        },
        message_count: {
            type: Number,
            default: 0
        },
        bucket_id: {
            type: Number,
            required: true
        }
    }, { timestamps: true, collection: 'messages' });

module.exports = model('Message', MessageBucketSchema);
