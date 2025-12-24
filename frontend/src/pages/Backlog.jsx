import React, { useState, useEffect } from 'react';
import { projectsAPI, sprintsAPI, tasksAPI } from '../services/api';

const Backlog = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [sprints, setSprints] = useState([]);
    const [backlogTasks, setBacklogTasks] = useState([]);
    const [activeSprint, setActiveSprint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSprintModal, setShowSprintModal] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [newSprint, setNewSprint] = useState({
        name: '',
        goal: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await projectsAPI.getAll();
            setProjects(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedProjectId(res.data.data[0]._id);
                fetchData(res.data.data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const fetchData = async (projectId) => {
        setLoading(true);
        try {
            const [sprintsRes, backlogRes] = await Promise.all([
                sprintsAPI.getByProject(projectId),
                sprintsAPI.getBacklog(projectId)
            ]);

            setSprints(sprintsRes.data.data);
            setBacklogTasks(backlogRes.data.data);

            const active = sprintsRes.data.data.find(s => s.status === 'active');
            if (active) {
                const sprintRes = await sprintsAPI.getOne(active._id);
                setActiveSprint(sprintRes.data.data);
            } else {
                setActiveSprint(null);
            }
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (projectId) => {
        setSelectedProjectId(projectId);
        setSelectedTasks([]);
        fetchData(projectId);
    };

    const handleCreateSprint = async (e) => {
        e.preventDefault();
        try {
            await sprintsAPI.create(selectedProjectId, newSprint);
            setShowSprintModal(false);
            setNewSprint({ name: '', goal: '', startDate: '', endDate: '' });
            fetchData(selectedProjectId);
        } catch (err) {
            console.error('Failed to create sprint');
        }
    };

    const handleStartSprint = async (sprintId) => {
        try {
            await sprintsAPI.start(sprintId);
            fetchData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to start sprint');
        }
    };

    const handleCompleteSprint = async (sprintId) => {
        if (confirm('Complete this sprint? Incomplete tasks will move to backlog.')) {
            try {
                await sprintsAPI.complete(sprintId, { moveToBacklog: true });
                fetchData(selectedProjectId);
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to complete sprint');
            }
        }
    };

    const handleMoveToSprint = async (sprintId) => {
        if (selectedTasks.length === 0) return;
        try {
            await sprintsAPI.addTasks(sprintId, selectedTasks);
            setSelectedTasks([]);
            fetchData(selectedProjectId);
        } catch (err) {
            console.error('Failed to move tasks');
        }
    };

    const handleMoveToBacklog = async (taskIds) => {
        try {
            if (activeSprint) {
                await sprintsAPI.removeTasks(activeSprint._id, taskIds);
                fetchData(selectedProjectId);
            }
        } catch (err) {
            console.error('Failed to move tasks to backlog');
        }
    };

    const toggleTaskSelection = (taskId) => {
        setSelectedTasks(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const issueTypeIcons = {
        task: 'bi-check2-square text-primary',
        bug: 'bi-bug text-danger',
        story: 'bi-bookmark text-success',
        epic: 'bi-lightning text-purple',
        subtask: 'bi-dash-square text-secondary'
    };

    const plannedSprints = sprints.filter(s => s.status === 'planned');

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="bi bi-list-ul me-2"></i>Backlog</h2>
                <div className="d-flex gap-2">
                    <select
                        className="form-select w-auto"
                        value={selectedProjectId}
                        onChange={(e) => handleProjectChange(e.target.value)}
                    >
                        {projects.length === 0 && <option>No projects</option>}
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => setShowSprintModal(true)}>
                        <i className="bi bi-plus-lg me-1"></i>Create Sprint
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="row">
                    {/* Sprint Column */}
                    <div className="col-lg-6 mb-4">
                        {/* Active Sprint */}
                        {activeSprint ? (
                            <div className="card border-0 shadow-sm mb-3">
                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0"><i className="bi bi-lightning-fill me-2"></i>{activeSprint.name}</h6>
                                        <small>{new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}</small>
                                    </div>
                                    <div className="d-flex gap-2 align-items-center">
                                        <span className="badge bg-light text-dark">
                                            {activeSprint.completedPoints}/{activeSprint.totalPoints} pts
                                        </span>
                                        <button className="btn btn-sm btn-light" onClick={() => handleCompleteSprint(activeSprint._id)}>
                                            Complete
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    {activeSprint.tasks?.length === 0 ? (
                                        <div className="text-center text-muted py-4">
                                            <i className="bi bi-inbox fs-4 d-block mb-2"></i>
                                            No tasks in sprint
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {activeSprint.tasks?.map(task => (
                                                <div key={task._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className={`bi ${issueTypeIcons[task.type]}`}></i>
                                                        <span className="text-muted small">{task.taskKey}</span>
                                                        <span>{task.title}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`badge bg-${task.status === 'done' ? 'success' : task.status === 'doing' ? 'primary' : 'secondary'}`}>
                                                            {task.status}
                                                        </span>
                                                        {task.storyPoints > 0 && <span className="badge bg-dark">{task.storyPoints}</span>}
                                                        <button className="btn btn-sm btn-link text-muted p-0" onClick={() => handleMoveToBacklog([task._id])}>
                                                            <i className="bi bi-arrow-down"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                No active sprint. Start a planned sprint to begin.
                            </div>
                        )}

                        {/* Planned Sprints */}
                        {plannedSprints.map(sprint => (
                            <div key={sprint._id} className="card border-0 shadow-sm mb-3">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0">{sprint.name}</h6>
                                        <small className="text-muted">{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleMoveToSprint(sprint._id)}
                                            disabled={selectedTasks.length === 0}
                                        >
                                            <i className="bi bi-arrow-up me-1"></i>Add Selected
                                        </button>
                                        <button className="btn btn-sm btn-success" onClick={() => handleStartSprint(sprint._id)}>
                                            Start Sprint
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Backlog Column */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                    <i className="bi bi-inbox me-2"></i>Product Backlog
                                    <span className="badge bg-secondary ms-2">{backlogTasks.length}</span>
                                </h6>
                                {selectedTasks.length > 0 && (
                                    <span className="badge bg-primary">{selectedTasks.length} selected</span>
                                )}
                            </div>
                            <div className="card-body p-0">
                                {backlogTasks.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="bi bi-check-circle fs-1 d-block mb-2 text-success"></i>
                                        <p>Backlog is empty</p>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {backlogTasks.map(task => (
                                            <label
                                                key={task._id}
                                                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedTasks.includes(task._id) ? 'bg-primary bg-opacity-10' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input me-2"
                                                        checked={selectedTasks.includes(task._id)}
                                                        onChange={() => toggleTaskSelection(task._id)}
                                                    />
                                                    <i className={`bi ${issueTypeIcons[task.type]}`}></i>
                                                    <span className="text-muted small">{task.taskKey}</span>
                                                    <span>{task.title}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    {task.storyPoints > 0 && <span className="badge bg-dark">{task.storyPoints}</span>}
                                                    <span className={`badge bg-${task.priority === 'high' || task.priority === 'highest' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Sprint Modal */}
            {showSprintModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-lightning me-2"></i>Create Sprint
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowSprintModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateSprint}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Sprint Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., Sprint 1"
                                            value={newSprint.name}
                                            onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Sprint Goal</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            placeholder="What do you want to achieve?"
                                            value={newSprint.goal}
                                            onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Start Date <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={newSprint.startDate}
                                                onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">End Date <span className="text-danger">*</span></label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={newSprint.endDate}
                                                onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowSprintModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="bi bi-check-lg me-1"></i>Create Sprint
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Backlog;
