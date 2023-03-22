const { Schema, model } = require('mongoose');

const LikeSchema = new Schema({
    message_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true
    }
}, { timestamps: true, collection: 'likes' });

module.exports = model('Like', LikeSchema);
