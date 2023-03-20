const express = require('express');

const UserRoutes = require('../routes/user.route');
const GroupRoutes = require('../routes/group.route');

const app = express();

/* A middleware that parses the body of the request and makes it available in the req.body object. */
app.use(express.json());

/* This is the root route. It is used to check if the server is running. */
app.get('/', (req, res) => {
    res.status(200).json({ alive: 'True' });
});

/* Telling the server to use the routes in the UserRoutes file. */
app.use('/api', UserRoutes);
app.use('/api', GroupRoutes);

module.exports = app;
