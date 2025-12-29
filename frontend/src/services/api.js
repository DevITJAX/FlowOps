import axios from 'axios';

// API URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me')
};

export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getOne: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    // Team member management
    getMembers: (id) => api.get(`/projects/${id}/members`),
    addMember: (id, data) => api.post(`/projects/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
    getAvailableUsers: (id) => api.get(`/projects/${id}/available-users`)
};

export const tasksAPI = {
    getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
    create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`)
};

export const usersAPI = {
    getAll: () => api.get('/users'),
    getOne: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
};

export const activityAPI = {
    getRecent: (limit = 20) => api.get(`/activity?limit=${limit}`),
    getByUser: (userId) => api.get(`/activity/user/${userId}`),
    getByTarget: (targetType, targetId) => api.get(`/activity/target/${targetType}/${targetId}`)
};

export const labelsAPI = {
    getByProject: (projectId) => api.get(`/projects/${projectId}/labels`),
    create: (projectId, data) => api.post(`/projects/${projectId}/labels`, data),
    update: (id, data) => api.put(`/labels/${id}`, data),
    delete: (id) => api.delete(`/labels/${id}`)
};

export const commentsAPI = {
    getByTask: (taskId) => api.get(`/tasks/${taskId}/comments`),
    create: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
    update: (id, data) => api.put(`/comments/${id}`, data),
    delete: (id) => api.delete(`/comments/${id}`)
};

export const timelogsAPI = {
    getByTask: (taskId) => api.get(`/tasks/${taskId}/timelogs`),
    create: (taskId, data) => api.post(`/tasks/${taskId}/timelogs`, data),
    update: (id, data) => api.put(`/timelogs/${id}`, data),
    delete: (id) => api.delete(`/timelogs/${id}`)
};

export const sprintsAPI = {
    getByProject: (projectId) => api.get(`/projects/${projectId}/sprints`),
    getOne: (id) => api.get(`/sprints/${id}`),
    create: (projectId, data) => api.post(`/projects/${projectId}/sprints`, data),
    update: (id, data) => api.put(`/sprints/${id}`, data),
    delete: (id) => api.delete(`/sprints/${id}`),
    start: (id) => api.put(`/sprints/${id}/start`),
    complete: (id, data) => api.put(`/sprints/${id}/complete`, data),
    addTasks: (id, taskIds) => api.post(`/sprints/${id}/tasks`, { taskIds }),
    removeTasks: (id, taskIds) => api.delete(`/sprints/${id}/tasks`, { data: { taskIds } }),
    getBacklog: (projectId) => api.get(`/projects/${projectId}/sprints/backlog`),
    getVelocity: (projectId, limit) => api.get(`/projects/${projectId}/sprints/velocity?limit=${limit || 5}`)
};

export const issueLinksAPI = {
    getByTask: (taskId) => api.get(`/tasks/${taskId}/links`),
    create: (taskId, data) => api.post(`/tasks/${taskId}/links`, data),
    delete: (id) => api.delete(`/links/${id}`)
};

export const attachmentsAPI = {
    getByTask: (taskId) => api.get(`/tasks/${taskId}/attachments`),
    upload: (taskId, formData) => api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    download: (id) => `${API_BASE_URL}/attachments/${id}/download`,
    delete: (id) => api.delete(`/attachments/${id}`)
};

export const notificationsAPI = {
    getAll: (limit = 20) => api.get(`/notifications?limit=${limit}`),
    getUnread: () => api.get('/notifications?unread=true'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    clearRead: () => api.delete('/notifications/clear')
};

export const teamsAPI = {
    getByProject: (projectId) => api.get(`/projects/${projectId}/teams`),
    getOne: (id) => api.get(`/teams/${id}`),
    create: (projectId, data) => api.post(`/projects/${projectId}/teams`, data),
    update: (id, data) => api.put(`/teams/${id}`, data),
    delete: (id) => api.delete(`/teams/${id}`),
    // Team member management
    addMember: (teamId, data) => api.post(`/teams/${teamId}/members`, data),
    removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
    updateMemberRole: (teamId, userId, data) => api.put(`/teams/${teamId}/members/${userId}`, data),
    getAvailableUsers: (teamId) => api.get(`/teams/${teamId}/available-users`)
};

export default api;

