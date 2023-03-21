const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../config/app');

require('dotenv').config();

beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
    await mongoose.connection.close();
});

const testHeader = { test_token: '' };

describe('POST /api/login', () => {
    it('should set user auth', async () => {
        const res = await request(app).post('/api/login').send({
            user_name: process.env.TEST_ADMIN_USER_NAME,
            password: process.env.TEST_ADMIN_PASSWORD
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        testHeader.test_token = res.body.data.test_token;
    });
});

let newGroupId = '';
const groupName = 'test_group_' + Math.floor(Math.random() * 10000);
describe('POST /api/groups/', () => {
    it('should create a new group', async () => {
        const res = await request(app).post(
            '/api/groups'
        ).send({
            group_name: groupName,
            description: 'Test description'
        }).set(testHeader);
        expect(res.statusCode).toBe(201);
        expect(res.body.data.group_name).toBe(groupName);
        newGroupId = res.body.data.group_id;
    });
});

describe('GET /api/groups', () => {
    it('should return all users joined groups', async () => {
        const res = await request(app).get('/api/groups').set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.groups.length).toBeGreaterThan(0);
    });
});

describe('GET /api/groups/:group_id', () => {
    it('should return a group data', async () => {
        const res = await request(app).get(
            `/api/groups/${newGroupId}`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.group_name).toBe(groupName);
        expect(res.body.data.description).toBe('Test description');
    });
});

describe('PATCH /api/groups/:group_id', () => {
    it('should update group data', async () => {
        const res = await request(app).patch(
            `/api/groups/${newGroupId}`
        ).send({
            description: 'Test description updated'
        }).set(testHeader);
        expect(res.statusCode).toBe(200);
    });

    it('should return updated group', async () => {
        const res = await request(app).get(
            `/api/groups/${newGroupId}`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.group_name).toBe(groupName);
        expect(res.body.data.description).toBe('Test description updated');
    });
});

let totalMembers = 0;
describe('GET /api/groups/:group_id/members', () => {
    it('should return a group members', async () => {
        const res = await request(app).get(
            `/api/groups/${newGroupId}/members`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.members.length).toBeGreaterThan(0);
        totalMembers = res.body.data.members.length;
    });
});

const userName = 'test_' + Math.floor(Math.random() * 10000);
let newUserId = '';
describe('POST /api/groups/:group_id/members/:user_id', () => {
    it('should create a new user', async () => {
        const res = await request(app).post(
            '/api/users'
        ).send({
            user_name: userName,
            password: 'test123',
            display_name: 'Test user',
            is_admin: false
        }).set(testHeader);
        expect(res.statusCode).toBe(201);
        expect(res.body.data.user_name).toBe(userName);
        newUserId = res.body.data.user_id;
    });

    it('should add a new member to group', async () => {
        const res = await request(app).post(
            `/api/groups/${newGroupId}/members/${newUserId}`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
    });

    it('should return a group members', async () => {
        const res = await request(app).get(
            `/api/groups/${newGroupId}/members`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.members.length).toBeGreaterThan(totalMembers);
        totalMembers = res.body.data.members.length;
    });
});

describe('PATCH /api/groups/:group_id/members/:user_id', () => {
    it('should update user rights', async () => {
        const res = await request(app).patch(
            `/api/groups/${newGroupId}/members/${newUserId}`
        ).send({
            admin: true
        }).set(testHeader);
        expect(res.statusCode).toBe(200);
    });
});

describe('DELETE /api/groups/:group_id/members/:user_id', () => {
    it('Remove user from ', async () => {
        const res = await request(app).delete(
            `/api/groups/${newGroupId}/members/${newUserId}`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
    });

    it('should return a group members', async () => {
        const res = await request(app).get(
            `/api/groups/${newGroupId}/members`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.members.length).toBeLessThan(totalMembers);
    });
});

describe('POST /api/groups/:group_id/messages/', () => {
    it('should add a new message to group', async () => {
        const res = await request(app).post(
            `/api/groups/${newGroupId}/messages/`
        ).send({
            message: 'First test message'
        }).set(testHeader);
        expect(res.statusCode).toBe(200);
    });
});

let messageId = '';
let likes = 0;
describe('GET /api/groups/:group_id/messages/', () => {
    it('should list group messages', async () => {
        const res = await request(app).get(
            `/api/groups/${newGroupId}/messages/`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.messages.length).toBeGreaterThan(0);
        messageId = res.body.data.messages[0]._id;
        likes = res.body.data.messages[0].likes;
    });
});

describe('POST /api/groups/:group_id/messages/:message_id', () => {
    it('should add like to message', async () => {
        const res = await request(app).post(
            `/api/groups/${newGroupId}/messages/${messageId}`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
    });

    it('should list group messages', async () => {
        const res = await request(app).get(
            `/api/groups/${newGroupId}/messages/`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.messages[0].likes).toBeGreaterThan(likes);
    });
});
