import React, { useState, useEffect } from 'react';
import { projectsAPI, sprintsAPI } from '../services/api';

const Reports = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [sprints, setSprints] = useState([]);
    const [velocity, setVelocity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadProjectData();
        }
    }, [selectedProject]);

    const loadProjects = async () => {
        try {
            const res = await projectsAPI.getAll();
            setProjects(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedProject(res.data.data[0]._id);
            }
        } catch (err) {
            console.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const loadProjectData = async () => {
        try {
            const [sprintsRes, velocityRes] = await Promise.all([
                sprintsAPI.getByProject(selectedProject),
                sprintsAPI.getVelocity(selectedProject, 5)
            ]);
            setSprints(sprintsRes.data.data || []);
            setVelocity(velocityRes.data.data || []);
        } catch (err) {
            console.error('Failed to load project data');
        }
    };

    const completedSprints = sprints.filter(s => s.status === 'completed');
    const activeSprint = sprints.find(s => s.status === 'active');
    const avgVelocity = velocity.length > 0
        ? Math.round(velocity.reduce((sum, v) => sum + v.completedPoints, 0) / velocity.length)
        : 0;

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
                    <h2 className="mb-1">Reports & Analytics</h2>
                    <p className="text-muted mb-0">Sprint velocity and project insights</p>
                </div>
                <select
                    className="form-select"
                    style={{ width: '250px' }}
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                >
                    {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-2">Total Sprints</h6>
                                    <h2 className="mb-0 fw-bold">{sprints.length}</h2>
                                </div>
                                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                                    <i className="bi bi-calendar3 fs-3"></i>
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
                                    <h6 className="text-muted mb-2">Completed Sprints</h6>
                                    <h2 className="mb-0 fw-bold">{completedSprints.length}</h2>
                                </div>
                                <div className="bg-success bg-opacity-10 text-success p-3 rounded-3">
                                    <i className="bi bi-check-circle-fill fs-3"></i>
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
                                    <h6 className="text-muted mb-2">Avg Velocity</h6>
                                    <h2 className="mb-0 fw-bold">{avgVelocity} pts</h2>
                                </div>
                                <div className="bg-info bg-opacity-10 text-info p-3 rounded-3">
                                    <i className="bi bi-speedometer2 fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Velocity Chart */}
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0">
                                <i className="bi bi-graph-up me-2"></i>
                                Sprint Velocity
                            </h5>
                        </div>
                        <div className="card-body">
                            {velocity.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-bar-chart-line fs-1 d-block mb-3"></i>
                                    <p>No completed sprints yet</p>
                                </div>
                            ) : (
                                <div className="d-flex align-items-end gap-3" style={{ height: '200px' }}>
                                    {velocity.map((v, index) => {
                                        const maxPoints = Math.max(...velocity.map(v => v.completedPoints || 1));
                                        const height = ((v.completedPoints || 0) / maxPoints) * 100;
                                        return (
                                            <div key={index} className="d-flex flex-column align-items-center flex-grow-1">
                                                <div
                                                    className="bg-primary rounded-top w-100"
                                                    style={{ height: `${height}%`, minHeight: '10px' }}
                                                    title={`${v.completedPoints} points`}
                                                ></div>
                                                <small className="text-muted mt-2 text-truncate" style={{ maxWidth: '80px' }}>
                                                    {v.name || `Sprint ${index + 1}`}
                                                </small>
                                                <strong className="small">{v.completedPoints} pts</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Sprint */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0">
                                <i className="bi bi-lightning me-2"></i>
                                Active Sprint
                            </h5>
                        </div>
                        <div className="card-body">
                            {activeSprint ? (
                                <div>
                                    <h6 className="fw-bold">{activeSprint.name}</h6>
                                    <p className="text-muted small mb-3">{activeSprint.goal || 'No goal set'}</p>
                                    <div className="mb-2">
                                        <small className="text-muted">Progress</small>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-success"
                                                style={{ width: `${activeSprint.progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between small text-muted">
                                        <span>Start: {new Date(activeSprint.startDate).toLocaleDateString()}</span>
                                        <span>End: {new Date(activeSprint.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <i className="bi bi-pause-circle fs-1 d-block mb-2"></i>
                                    <p className="mb-0">No active sprint</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
