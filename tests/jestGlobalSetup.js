const mongoose = require('mongoose');
const { checkAndAddTestAdminUser } = require('../controllers/user.controller');
require('dotenv').config();

module.exports = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await checkAndAddTestAdminUser();
    await mongoose.connection.close();
};
