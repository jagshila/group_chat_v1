const express = require('express');
const auth = require('../middleware/auth');
const {
    getUsers,
    getUser,
    createUser,
    updateUser
} = require('../controllers/user.controller');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/users', auth, getUsers);

router.get('/users/:id', auth, getUser);

router.post('/users', adminAuth, createUser);

router.patch('/users/:id', auth, updateUser);

// router.delete('/users/:id', adminAuth, deleteUser);

module.exports = router;
