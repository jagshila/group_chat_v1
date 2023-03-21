const express = require('express');
const cookieParser = require('cookie-parser');
const UserRoutes = require('../routes/user.route');
const GroupRoutes = require('../routes/group.route');
const AuthRoutes = require('../routes/auth.route');

const app = express();

/* A middleware that parses the body of the request and makes it available in the req.body object. */
app.use(express.json());
app.use(cookieParser());

/* This is the root route. It is used to check if the server is running. */
const startTime = (new Date()).toLocaleString();

/* API root */
app.get('/', (req, res) => {
    res.status(200).json({ alive: 'True', start_time: startTime });
});

/* Telling the server to use the routes */
app.use('/api', UserRoutes);
app.use('/api', GroupRoutes);
app.use('/api', AuthRoutes);

module.exports = app;
