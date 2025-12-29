const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // Join user's personal room
        socket.join(`user:${socket.user._id}`);

        // Join project rooms
        socket.on('join:project', (projectId) => {
            socket.join(`project:${projectId}`);
            console.log(`${socket.user.name} joined project: ${projectId}`);
        });

        socket.on('leave:project', (projectId) => {
            socket.leave(`project:${projectId}`);
            console.log(`${socket.user.name} left project: ${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper functions to emit events
const emitToProject = (projectId, event, data) => {
    if (io) {
        io.to(`project:${projectId}`).emit(event, data);
    }
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitToProject,
    emitToUser
};
