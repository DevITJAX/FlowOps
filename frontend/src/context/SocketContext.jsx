import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem('token');

            const newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                setConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [user]);

    const joinProject = (projectId) => {
        if (socket && connected) {
            socket.emit('join:project', projectId);
        }
    };

    const leaveProject = (projectId) => {
        if (socket && connected) {
            socket.emit('leave:project', projectId);
        }
    };

    const subscribe = (event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => { };
    };

    return (
        <SocketContext.Provider value={{ socket, connected, joinProject, leaveProject, subscribe }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
