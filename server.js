'use strict';
const { createServer } = require('http');
const { initSocket } = require('./socket/init');
const mongoose = require('mongoose');
const app = require('./config/app');
const http = createServer(app);
const { Server } = require('socket.io');
const { checkAndAddTestAdminUser } = require('./controllers/user.controller');

require('dotenv').config();

const io = new Server(http, {

});

initSocket(io);

const PORT = process.env.PORT || 8080;

console.log(process.env.MONGODB_URI);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        checkAndAddTestAdminUser();
        http.listen(PORT, console.log(`Server started on port ${PORT}`));
    })
    .catch((err) => {
        console.log(err);
    });
