const express = require('express');
const cookieParser = require('cookie-parser');
const UserRoutes = require('../routes/user.route');
const GroupRoutes = require('../routes/group.route');
const AuthRoutes = require('../routes/auth.route');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger-output.json');
const app = express();

/* A middleware that parses the body of the request and makes it available in the req.body object. */
app.use(express.json());
app.use(cookieParser());

/* This is the root route. It is used to check if the server is running. */
const startTime = (new Date()).toLocaleString();

/* API root */
app.get('/', (req, res) => {
    // successResponse(res, StatusCodes.OK, { alive: 'True', start_time: startTime }, 'Server working');
    res.send(`
    <h2>Group chat APIs</h2>
    <h3> Server alive </h3>
    <p> Live since: ${startTime}</p>
    <p>APIs hosted at <b><i>/api</i></b></p>
    <p>Visit swagger docs to experiment with apis</p>
    <p><a href="/api-docs">Swagger docs</a></p>
    <p><a href="https://github.com/jagshila/group_chat_v1">Github link</a>
    `);
});

/* Telling the server to use the routes */
app.use('/api', UserRoutes);
app.use('/api', GroupRoutes);
app.use('/api', AuthRoutes);

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

module.exports = app;
