const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FlowOps API',
            version: '1.0.2',
            description: 'Project Management API - Jira-like task and project management system',
            contact: {
                name: 'FlowOps Team'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['admin', 'project_manager', 'member'] }
                    }
                },
                Project: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        key: { type: 'string' },
                        description: { type: 'string' },
                        status: { type: 'string', enum: ['planned', 'in_progress', 'completed'] },
                        owner: { type: 'string' },
                        members: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Task: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        taskKey: { type: 'string' },
                        type: { type: 'string', enum: ['task', 'bug', 'story', 'epic', 'subtask'] },
                        status: { type: 'string', enum: ['todo', 'doing', 'review', 'done'] },
                        priority: { type: 'string', enum: ['lowest', 'low', 'medium', 'high', 'highest'] },
                        storyPoints: { type: 'number' },
                        project: { type: 'string' },
                        assignee: { type: 'string' },
                        reporter: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
