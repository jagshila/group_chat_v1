const jwt = require('jsonwebtoken');

const jwtConfig = {
    SECRET: process.env.JWT_SECRET || 'secret',
    PAYLOAD: { issuer: 'group_chat_server', audience: 'group_chat_client' }
};

const createToken = (userId, admin = false) => {
    return jwt.sign(
        { id: userId, admin },
        jwtConfig.SECRET,
        jwtConfig.PAYLOAD
    );
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtConfig.SECRET,
            jwtConfig.PAYLOAD);
        return { success: true, decoded, msg: 'Success' };
    } catch (err) {
        return { success: false, decoded: {}, msg: 'Invalid token' };
    }
};

module.exports = { createToken, verifyToken };
