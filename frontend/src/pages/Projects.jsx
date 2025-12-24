import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', status: 'planned' });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await projectsAPI.getAll();
            setProjects(res.data.data);
        } catch (err) {
            console.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await projectsAPI.create(newProject);
            setShowModal(false);
            setNewProject({ name: '', description: '', status: 'planned' });
            fetchProjects();
        } catch (err) {
            console.error('Failed to create project');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Projects</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i> New Project
                </button>
            </div>

            <div className="row g-4">
                {projects.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted fs-4">No projects found. Create your first one!</p>
                    </div>
                ) : (
                    projects.map(project => (
                        <div key={project._id} className="col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="dropdown float-end">
                                        <button className="btn btn-link link-dark p-0" data-bs-toggle="dropdown">
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li><button className="dropdown-item text-danger" onClick={() => projectsAPI.delete(project._id).then(fetchProjects)}>Delete</button></li>
                                        </ul>
                                    </div>
                                    <h5 className="card-title fw-bold mb-3">{project.name}</h5>
                                    <p className="card-text text-muted mb-4 text-truncate-2">{project.description}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className={`badge bg-${project.status === 'completed' ? 'success' : project.status === 'in_progress' ? 'warning' : 'info'}`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                        <small className="text-muted">{new Date(project.createdAt).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Basic Bootstrap Modal (manual trigger since we aren't using a library) */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">New Project</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Project Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newProject.name}
                                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={newProject.description}
                                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={newProject.status}
                                            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                                        >
                                            <option value="planned">Planned</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Project</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
