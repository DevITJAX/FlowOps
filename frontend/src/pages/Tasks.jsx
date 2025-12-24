import React, { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI, labelsAPI } from '../services/api';
import TaskDetailModal from '../components/TaskDetailModal';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [labels, setLabels] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        storyPoints: 0,
        originalEstimate: 0,
        dueDate: '',
        labels: []
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
                fetchTasks(res.data.data[0]._id);
                fetchLabels(res.data.data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const fetchTasks = async (projectId) => {
        setLoading(true);
        try {
            const res = await tasksAPI.getByProject(projectId);
            setTasks(res.data.data);
        } catch (err) {
            console.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchLabels = async (projectId) => {
        try {
            const res = await labelsAPI.getByProject(projectId);
            setLabels(res.data.data);
        } catch (err) {
            console.error('Failed to fetch labels');
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await tasksAPI.update(taskId, { status: newStatus });
            fetchTasks(selectedProjectId);
        } catch (err) {
            console.error('Failed to update task');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                ...newTask,
                originalEstimate: newTask.originalEstimate * 60 // convert hours to minutes
            };
            await tasksAPI.create(selectedProjectId, taskData);
            setShowModal(false);
            setNewTask({
                title: '',
                description: '',
                type: 'task',
                priority: 'medium',
                storyPoints: 0,
                originalEstimate: 0,
                dueDate: '',
                labels: []
            });
            fetchTasks(selectedProjectId);
        } catch (err) {
            console.error('Failed to create task');
        }
    };

    const handleProjectChange = (projectId) => {
        setSelectedProjectId(projectId);
        fetchTasks(projectId);
        fetchLabels(projectId);
    };

    const columns = [
        { id: 'todo', title: 'To Do', color: 'secondary', icon: 'bi-circle' },
        { id: 'doing', title: 'In Progress', color: 'primary', icon: 'bi-arrow-repeat' },
        { id: 'review', title: 'In Review', color: 'warning', icon: 'bi-eye' },
        { id: 'done', title: 'Done', color: 'success', icon: 'bi-check-circle-fill' }
    ];

    const issueTypeIcons = {
        task: 'bi-check2-square text-primary',
        bug: 'bi-bug text-danger',
        story: 'bi-bookmark text-success',
        epic: 'bi-lightning text-purple',
        subtask: 'bi-dash-square text-secondary'
    };

    const storyPointOptions = [0, 1, 2, 3, 5, 8, 13, 21];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="bi bi-kanban me-2"></i>Task Board</h2>
                <div className="d-flex gap-2">
                    <select
                        className="form-select w-auto"
                        value={selectedProjectId}
                        onChange={(e) => handleProjectChange(e.target.value)}
                    >
                        {projects.length === 0 && <option>No projects</option>}
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                        disabled={!selectedProjectId}
                    >
                        <i className="bi bi-plus-lg me-1"></i> Create Issue
                    </button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Create a project first to start adding tasks.
                </div>
            ) : (
                <div className="row g-3">
                    {columns.map(col => (
                        <div key={col.id} className="col-lg-3">
                            <div className={`kanban-col h-100 shadow-sm border-top border-3 border-${col.color}`}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0 text-uppercase small text-muted">
                                        <i className={`bi ${col.icon} me-2`}></i>{col.title}
                                    </h6>
                                    <span className="badge bg-light text-dark rounded-pill border">
                                        {tasks.filter(t => t.status === col.id).length}
                                    </span>
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    {tasks.filter(t => t.status === col.id).map(task => (
                                        <div
                                            key={task._id}
                                            className="card border-0 shadow-sm cursor-pointer"
                                            onClick={() => setSelectedTask(task)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className={`bi ${issueTypeIcons[task.type] || issueTypeIcons.task}`}></i>
                                                        <small className="text-muted">{task.taskKey}</small>
                                                    </div>
                                                    {task.storyPoints > 0 && (
                                                        <span className="badge bg-dark rounded-pill">{task.storyPoints}</span>
                                                    )}
                                                </div>
                                                <h6 className="mb-2 fw-bold">{task.title}</h6>

                                                {task.labels?.length > 0 && (
                                                    <div className="d-flex flex-wrap gap-1 mb-2">
                                                        {task.labels.map(label => (
                                                            <span key={label._id} className="badge" style={{ backgroundColor: label.color, fontSize: '0.65rem' }}>
                                                                {label.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className={`badge bg-${task.priority === 'highest' || task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'} bg-opacity-10 text-${task.priority === 'highest' || task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                                                        <i className="bi bi-flag-fill me-1"></i>{task.priority}
                                                    </span>
                                                    <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                                                        <button className="btn btn-sm btn-light py-0 px-2" data-bs-toggle="dropdown">
                                                            <i className="bi bi-three-dots-vertical"></i>
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-end">
                                                            {columns.filter(c => c.id !== col.id).map(c => (
                                                                <li key={c.id}>
                                                                    <button className="dropdown-item small" onClick={() => updateTaskStatus(task._id, c.id)}>
                                                                        <i className={`bi ${c.icon} me-2`}></i>Move to {c.title}
                                                                    </button>
                                                                </li>
                                                            ))}
                                                            <li><hr className="dropdown-divider" /></li>
                                                            <li>
                                                                <button className="dropdown-item small text-danger" onClick={() => tasksAPI.delete(task._id).then(() => fetchTasks(selectedProjectId))}>
                                                                    <i className="bi bi-trash me-2"></i>Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                                    {task.assignee ? (
                                                        <div className="d-flex align-items-center gap-1">
                                                            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}>
                                                                {task.assignee.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted small">Unassigned</span>
                                                    )}
                                                    {task.dueDate && (
                                                        <small className={`${new Date(task.dueDate) < new Date() ? 'text-danger' : 'text-muted'}`}>
                                                            <i className="bi bi-calendar me-1"></i>
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {tasks.filter(t => t.status === col.id).length === 0 && (
                                        <div className="text-center text-muted small py-4">
                                            <i className="bi bi-inbox fs-4 d-block mb-2"></i>
                                            No issues
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={() => fetchTasks(selectedProjectId)}
                />
            )}

            {/* Create Task Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-plus-circle me-2"></i>Create Issue
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateTask}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="mb-3">
                                                <label className="form-label">Title <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newTask.title}
                                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    value={newTask.description}
                                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Issue Type</label>
                                                <select
                                                    className="form-select"
                                                    value={newTask.type}
                                                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                                                >
                                                    <option value="task">Task</option>
                                                    <option value="bug">Bug</option>
                                                    <option value="story">Story</option>
                                                    <option value="epic">Epic</option>
                                                    <option value="subtask">Sub-task</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Priority</label>
                                                <select
                                                    className="form-select"
                                                    value={newTask.priority}
                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                                >
                                                    <option value="lowest">Lowest</option>
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="highest">Highest</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Story Points</label>
                                                <select
                                                    className="form-select"
                                                    value={newTask.storyPoints}
                                                    onChange={(e) => setNewTask({ ...newTask, storyPoints: parseInt(e.target.value) })}
                                                >
                                                    {storyPointOptions.map(sp => (
                                                        <option key={sp} value={sp}>{sp === 0 ? 'None' : sp}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Original Estimate (hours)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    value={newTask.originalEstimate}
                                                    onChange={(e) => setNewTask({ ...newTask, originalEstimate: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Due Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={newTask.dueDate}
                                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="bi bi-check-lg me-1"></i>Create Issue
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

export default Tasks;
