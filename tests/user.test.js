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
            user_name: 'admin',
            password: 'admin123'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        testHeader.test_token = res.body.data.test_token;
    });
});

describe('GET /api/users', () => {
    it('should return all users', async () => {
        const res = await request(app).get('/api/users').set(testHeader);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.users.length).toBeGreaterThan(0);
    });
});

let newUserId = '';
const userName = 'test_' + Math.floor(Math.random() * 10000);
describe('POST /api/users/', () => {
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
});

describe('GET /api/users/:id', () => {
    it('should return a user', async () => {
        const res = await request(app).get(
            `/api/users/${newUserId}`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.user_name).toBe(userName);
        expect(res.body.data.display_name).toBe('Test user');
    });
});

describe('PATCH /api/users/:user_id', () => {
    it('should update user data', async () => {
        const res = await request(app).patch(
            `/api/users/${newUserId}`
        ).send({
            display_name: 'Test user updated'
        }).set(testHeader);
        expect(res.statusCode).toBe(200);
    });

    it('should return updated user', async () => {
        const res = await request(app).get(
            `/api/users/${newUserId}`
        ).set(testHeader);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.user_name).toBe(userName);
        expect(res.body.data.display_name).toBe('Test user updated');
    });
});
