const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    display_name: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String
    },
    user_image: {
        type: String
    },
    change_password: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, collection: 'users' });

UserSchema.index({ display_name: 'text', user_name: 'text' }, { weights: { display_name: 1, user_name: 1 } });
module.exports = model('User', UserSchema);
