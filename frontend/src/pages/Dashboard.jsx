import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, activityAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalProjects: 0, activeTasks: 0, completedTasks: 0 });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const projectsRes = await projectsAPI.getAll();
            const projects = projectsRes.data.data;
            setRecentProjects(projects.slice(0, 5));

            // Count tasks across all projects
            let activeTasks = 0;
            let completedTasks = 0;

            for (const project of projects.slice(0, 3)) {
                try {
                    const tasksRes = await tasksAPI.getByProject(project._id);
                    const tasks = tasksRes.data.data;
                    activeTasks += tasks.filter(t => t.status === 'doing').length;
                    completedTasks += tasks.filter(t => t.status === 'done').length;
                } catch (err) {
                    // Skip if no access
                }
            }

            setStats({
                totalProjects: projects.length,
                activeTasks,
                completedTasks
            });

            // Try to load activity (may fail if no activity yet)
            try {
                const activityRes = await activityAPI.getRecent(10);
                setRecentActivity(activityRes.data.data);
            } catch (err) {
                setRecentActivity([]);
            }
        } catch (err) {
            console.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Welcome back, {user?.name}!</h2>
                    <p className="text-muted mb-0">Here's what's happening with your projects</p>
                </div>
                <span className="badge bg-primary px-3 py-2 text-uppercase">{user?.role?.replace('_', ' ')}</span>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Total Projects</h6>
                                    <h2 className="mb-0 fw-bold">{stats.totalProjects}</h2>
                                </div>
                                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                                    <i className="bi bi-folder-fill fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Active Tasks</h6>
                                    <h2 className="mb-0 fw-bold">{stats.activeTasks}</h2>
                                </div>
                                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-3">
                                    <i className="bi bi-list-task fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Completed</h6>
                                    <h2 className="mb-0 fw-bold">{stats.completedTasks}</h2>
                                </div>
                                <div className="bg-success bg-opacity-10 text-success p-3 rounded-3">
                                    <i className="bi bi-check-circle-fill fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Projects & Activity */}
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="bi bi-folder me-2"></i>Recent Projects</h5>
                            <Link to="/projects" className="btn btn-sm btn-outline-primary">View All</Link>
                        </div>
                        <div className="card-body p-0">
                            {recentProjects.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-folder-x fs-1 d-block mb-3"></i>
                                    <p className="mb-3">No projects yet</p>
                                    <Link to="/projects" className="btn btn-primary btn-sm">Create Your First Project</Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Project Name</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentProjects.map(project => (
                                                <tr key={project._id}>
                                                    <td className="fw-medium">{project.name}</td>
                                                    <td>
                                                        <span className={`badge bg-${project.status === 'completed' ? 'success' : project.status === 'in_progress' ? 'warning' : 'info'}`}>
                                                            {project.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted small">{new Date(project.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0"><i className="bi bi-activity me-2"></i>Recent Activity</h5>
                        </div>
                        <div className="card-body">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="bi bi-clock-history fs-3 d-block mb-2"></i>
                                    <small>No activity yet</small>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {recentActivity.slice(0, 5).map(activity => (
                                        <div key={activity._id} className="d-flex gap-3">
                                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                                <i className="bi bi-person text-primary"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0 small">
                                                    <strong>{activity.user?.name || 'User'}</strong>
                                                    <span className="text-muted"> {activity.action.replace(/_/g, ' ')}</span>
                                                </p>
                                                <small className="text-muted">{formatTimeAgo(activity.createdAt)}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
