const express = require('express');
const {
    getAuthToken,
    logout
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', getAuthToken);

router.get('/logout', logout);

// router.delete('/users/:id', adminAuth, deleteUser);

module.exports = router;
