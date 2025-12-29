// FlowOps Backend Server - v1.0.5 (Azure fix)
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io only if enabled
if (process.env.ENABLE_WEBSOCKETS === 'true') {
    try {
        const { initializeSocket } = require('./config/socket');
        initializeSocket(server);
        console.log('Socket.io enabled');
    } catch (err) {
        console.error('Socket.io initialization failed:', err.message);
    }
}

// Body parser
app.use(express.json());

// Enable CORS - allow all origins for Azure compatibility
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Swagger API Documentation (optional in production)
try {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./config/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'FlowOps API Documentation'
    }));
} catch (err) {
    console.log('Swagger documentation not available');
}

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sprints', require('./routes/sprintActions'));
app.use('/api/teams', require('./routes/teams').teamRouter);
app.use('/api/activity', require('./routes/activity'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/labels', require('./routes/labels'));
app.use('/api/timelogs', require('./routes/timelogs'));
app.use('/api/links', require('./routes/issueLinks'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search', require('./routes/search'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
