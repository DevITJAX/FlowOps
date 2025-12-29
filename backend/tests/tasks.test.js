const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../routes/auth'));
    app.use('/api/projects', require('../routes/projects'));
    app.use('/api/tasks', require('../routes/tasks'));
    return app;
};

describe('Tasks Controller', () => {
    let app;
    let token;
    let userId;
    let projectId;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(async () => {
        // Create a test user and login
        const user = await User.create({
            name: 'Task Tester',
            email: 'tasktester@example.com',
            password: 'password123'
        });
        userId = user._id;

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'tasktester@example.com',
                password: 'password123'
            });
        token = loginRes.body.token;

        // Create a test project
        const project = await Project.create({
            name: 'Test Project',
            description: 'Test project for tasks',
            owner: userId
        });
        projectId = project._id;
    });

    describe('POST /api/projects/:projectId/tasks', () => {
        it('should create a new task', async () => {
            const res = await request(app)
                .post(`/api/projects/${projectId}/tasks`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Test Task',
                    description: 'This is a test task',
                    type: 'task',
                    priority: 'high'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New Test Task');
            expect(res.body.data.taskKey).toBeDefined();
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .post(`/api/projects/${projectId}/tasks`)
                .send({
                    title: 'Unauthorized Task'
                });

            expect(res.status).toBe(401);
        });

        it('should fail without title', async () => {
            const res = await request(app)
                .post(`/api/projects/${projectId}/tasks`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: 'Task without title'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/projects/:projectId/tasks', () => {
        beforeEach(async () => {
            // Create some test tasks
            await Task.create([
                { title: 'Task 1', project: projectId, reporter: userId },
                { title: 'Task 2', project: projectId, reporter: userId, status: 'doing' },
                { title: 'Task 3', project: projectId, reporter: userId, status: 'done' }
            ]);
        });

        it('should get all tasks for a project', async () => {
            const res = await request(app)
                .get(`/api/projects/${projectId}/tasks`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(3);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .get(`/api/projects/${projectId}/tasks`);

            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/tasks/:id', () => {
        let taskId;

        beforeEach(async () => {
            const task = await Task.create({
                title: 'Task to Update',
                project: projectId,
                reporter: userId
            });
            taskId = task._id;
        });

        it('should update a task', async () => {
            const res = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Task Title',
                    status: 'doing',
                    priority: 'highest'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Updated Task Title');
            expect(res.body.data.status).toBe('doing');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        let taskId;

        beforeEach(async () => {
            const task = await Task.create({
                title: 'Task to Delete',
                project: projectId,
                reporter: userId
            });
            taskId = task._id;
        });

        it('should delete a task', async () => {
            const res = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify task is deleted
            const task = await Task.findById(taskId);
            expect(task).toBeNull();
        });
    });
});
