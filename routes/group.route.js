const express = require('express');
const auth = require('../middleware/auth');
const {
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addGroupMember,
    updateMemberRights,
    removeGroupMember
} = require('../controllers/group.controller');

const router = express.Router();

/* Creating the routes for the product controller. */
router.get('/groups', auth, getGroups);

router.get('/groups/:id', auth, getGroup);

router.post('/groups', auth, createGroup);

router.patch('/groups/:id', auth, updateGroup);

router.delete('/groups/:id', auth, deleteGroup);

router.get('/groups/:id/members', auth, getGroupMembers);

// router.get('/groups/:id/members/:member_id', auth, getGroupMemberDetails);

router.post('/groups/:id/members/:member_id', auth, addGroupMember);

router.patch('/groups/:id/members/:member_id', auth, updateMemberRights);

router.delete('/groups/:id/members/:member_id', auth, removeGroupMember);

module.exports = router;
