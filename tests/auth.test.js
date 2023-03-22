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

describe('POST /api/login', () => {
    it('should set user auth', async () => {
        const res = await request(app).post('/api/login').send({
            user_name: process.env.TEST_ADMIN_USER_NAME,
            password: process.env.TEST_ADMIN_PASSWORD
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe('GET /api/logout', () => {
    it('should remove auth', async () => {
        const res = await request(app).get('/api/logout');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// Errors

describe('POST /api/login - no password', () => {
    it('should set user auth', async () => {
        const res = await request(app).post('/api/login').send({
            user_name: process.env.TEST_ADMIN_USER_NAME
        });
        expect(res.body.success).toBe(false);
        expect(res.statusCode).toBe(400);
    });
});

describe('POST /api/login - wrong password', () => {
    it('should set user auth', async () => {
        const res = await request(app).post('/api/login').send({
            user_name: process.env.TEST_ADMIN_USER_NAME,
            password: 'Wrong password'
        });
        expect(res.body.success).toBe(false);
        expect(res.statusCode).toBe(401);
    });
});

describe('POST /api/login - no user', () => {
    it('should set user auth', async () => {
        const res = await request(app).post('/api/login').send({
            user_name: 'x',
            password: 'Wrong password'
        });
        expect(res.body.success).toBe(false);
        expect(res.statusCode).toBe(404);
    });
});
