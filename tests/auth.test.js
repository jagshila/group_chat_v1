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
            user_name: 'admin',
            password: 'admin123'
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
