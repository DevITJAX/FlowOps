const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../routes/auth'));
    app.use('/api/projects', require('../routes/projects'));
    return app;
};

describe('Projects Controller', () => {
    let app;
    let token;
    let userId;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(async () => {
        // Create a test user and login
        const user = await User.create({
            name: 'Project Tester',
            email: 'projecttester@example.com',
            password: 'password123'
        });
        userId = user._id;

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'projecttester@example.com',
                password: 'password123'
            });
        token = loginRes.body.token;
    });

    describe('POST /api/projects', () => {
        it('should create a new project', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New Project',
                    description: 'A test project'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('New Project');
            expect(res.body.data.key).toBeDefined();
        });

        it('should auto-generate project key', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'FlowOps Project',
                    description: 'Testing key generation'
                });

            expect(res.status).toBe(201);
            expect(res.body.data.key).toMatch(/^FLOW/);
        });

        it('should use custom project key', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Custom Key Project',
                    description: 'Testing custom key',
                    key: 'CUST'
                });

            expect(res.status).toBe(201);
            expect(res.body.data.key).toBe('CUST');
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/projects')
                .send({
                    name: 'Unauthorized Project',
                    description: 'Should fail'
                });

            expect(res.status).toBe(401);
        });

        it('should fail without name', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: 'Project without name'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/projects', () => {
        beforeEach(async () => {
            await Project.create([
                { name: 'Project A', description: 'First project', owner: userId },
                { name: 'Project B', description: 'Second project', owner: userId }
            ]);
        });

        it('should get all projects for user', async () => {
            const res = await request(app)
                .get('/api/projects')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('GET /api/projects/:id', () => {
        let projectId;

        beforeEach(async () => {
            const project = await Project.create({
                name: 'Single Project',
                description: 'Get by ID test',
                owner: userId
            });
            projectId = project._id;
        });

        it('should get a single project', async () => {
            const res = await request(app)
                .get(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Single Project');
        });

        it('should return 404 for non-existent project', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .get(`/api/projects/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/projects/:id', () => {
        let projectId;

        beforeEach(async () => {
            const project = await Project.create({
                name: 'Project to Update',
                description: 'Update test',
                owner: userId
            });
            projectId = project._id;
        });

        it('should update a project', async () => {
            const res = await request(app)
                .put(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Project Name',
                    status: 'in_progress'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Updated Project Name');
            expect(res.body.data.status).toBe('in_progress');
        });
    });

    describe('DELETE /api/projects/:id', () => {
        let projectId;

        beforeEach(async () => {
            const project = await Project.create({
                name: 'Project to Delete',
                description: 'Delete test',
                owner: userId
            });
            projectId = project._id;
        });

        it('should delete a project', async () => {
            const res = await request(app)
                .delete(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify project is deleted
            const project = await Project.findById(projectId);
            expect(project).toBeNull();
        });
    });
});
