const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../routes/auth'));
    return app;
};

describe('Auth Controller', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe('test@example.com');
        });

        it('should fail with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test2@example.com',
                    password: '123'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail with duplicate email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'duplicate@example.com',
                    password: 'password123'
                });

            // Second registration with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Another User',
                    email: 'duplicate@example.com',
                    password: 'password456'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            await User.create({
                name: 'Login Test',
                email: 'login@example.com',
                password: 'password123'
            });
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
        });

        it('should fail with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        beforeEach(async () => {
            await User.create({
                name: 'Reset Test',
                email: 'reset@example.com',
                password: 'password123'
            });
        });

        it('should generate reset token for existing user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'reset@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.resetToken).toBeDefined(); // In dev mode

            // Verify token was saved
            const user = await User.findOne({ email: 'reset@example.com' });
            expect(user.resetPasswordToken).toBeDefined();
            expect(user.resetPasswordExpire).toBeDefined();
        });

        it('should not reveal if email does not exist', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user with valid token', async () => {
            // Register a user first
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Me Test',
                    email: 'me@example.com',
                    password: 'password123'
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('me@example.com');
        });

        it('should fail without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
