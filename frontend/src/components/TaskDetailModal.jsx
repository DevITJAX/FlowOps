import React, { useState, useEffect } from 'react';
import { commentsAPI, timelogsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TaskDetailModal = ({ task, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('details');
    const [comments, setComments] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newTimeLog, setNewTimeLog] = useState({ hours: '', minutes: '', description: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            loadComments();
            loadTimeLogs();
        }
    }, [task]);

    const loadComments = async () => {
        try {
            const res = await commentsAPI.getByTask(task._id);
            setComments(res.data.data);
        } catch (err) {
            console.error('Failed to load comments');
        }
    };

    const loadTimeLogs = async () => {
        try {
            const res = await timelogsAPI.getByTask(task._id);
            setTimeLogs(res.data.data);
        } catch (err) {
            console.error('Failed to load time logs');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            await commentsAPI.create(task._id, { content: newComment });
            setNewComment('');
            loadComments();
        } catch (err) {
            console.error('Failed to add comment');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await commentsAPI.delete(commentId);
            loadComments();
        } catch (err) {
            console.error('Failed to delete comment');
        }
    };

    const handleLogTime = async (e) => {
        e.preventDefault();
        const totalMinutes = (parseInt(newTimeLog.hours) || 0) * 60 + (parseInt(newTimeLog.minutes) || 0);
        if (totalMinutes <= 0) return;

        setLoading(true);
        try {
            await timelogsAPI.create(task._id, {
                timeSpent: totalMinutes,
                description: newTimeLog.description
            });
            setNewTimeLog({ hours: '', minutes: '', description: '' });
            loadTimeLogs();
            onUpdate && onUpdate();
        } catch (err) {
            console.error('Failed to log time');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const totalTimeLogged = timeLogs.reduce((sum, log) => sum + log.timeSpent, 0);

    const issueTypeIcons = {
        task: 'bi-check2-square text-primary',
        bug: 'bi-bug text-danger',
        story: 'bi-bookmark text-success',
        epic: 'bi-lightning text-purple',
        subtask: 'bi-dash-square text-secondary'
    };

    const priorityColors = {
        highest: 'danger',
        high: 'danger',
        medium: 'warning',
        low: 'info',
        lowest: 'secondary'
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header border-0 pb-0">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <i className={`bi ${issueTypeIcons[task.type] || issueTypeIcons.task}`}></i>
                                <span className="text-muted small">{task.taskKey || 'TASK'}</span>
                            </div>
                            <h5 className="modal-title fw-bold">{task.title}</h5>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {/* Tabs */}
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                                    <i className="bi bi-info-circle me-1"></i>Details
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                                    <i className="bi bi-chat-dots me-1"></i>Comments ({comments.length})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'time' ? 'active' : ''}`} onClick={() => setActiveTab('time')}>
                                    <i className="bi bi-clock me-1"></i>Time Tracking
                                </button>
                            </li>
                        </ul>

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="row">
                                <div className="col-md-8">
                                    <h6 className="text-muted small text-uppercase">Description</h6>
                                    <p className="mb-4">{task.description || 'No description provided.'}</p>
                                </div>
                                <div className="col-md-4">
                                    <div className="bg-light rounded p-3">
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Status</small>
                                            <span className={`badge bg-${task.status === 'done' ? 'success' : task.status === 'doing' ? 'primary' : 'secondary'}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Priority</small>
                                            <span className={`badge bg-${priorityColors[task.priority]}`}>{task.priority}</span>
                                        </div>
                                        {task.storyPoints > 0 && (
                                            <div className="mb-3">
                                                <small className="text-muted d-block">Story Points</small>
                                                <span className="badge bg-dark">{task.storyPoints}</span>
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Assignee</small>
                                            <span>{task.assignee?.name || 'Unassigned'}</span>
                                        </div>
                                        {task.dueDate && (
                                            <div className="mb-3">
                                                <small className="text-muted d-block">Due Date</small>
                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Time Logged</small>
                                            <span>{formatTime(task.timeSpent || 0)} / {formatTime(task.originalEstimate || 0)}</span>
                                        </div>
                                        {task.labels?.length > 0 && (
                                            <div>
                                                <small className="text-muted d-block">Labels</small>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {task.labels.map(label => (
                                                        <span key={label._id} className="badge" style={{ backgroundColor: label.color }}>{label.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div>
                                <form onSubmit={handleAddComment} className="mb-4">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Add a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <button className="btn btn-primary" type="submit" disabled={loading}>
                                            <i className="bi bi-send"></i>
                                        </button>
                                    </div>
                                </form>

                                <div className="d-flex flex-column gap-3">
                                    {comments.length === 0 ? (
                                        <div className="text-center text-muted py-4">
                                            <i className="bi bi-chat-dots fs-3 d-block mb-2"></i>
                                            No comments yet
                                        </div>
                                    ) : (
                                        comments.map(comment => (
                                            <div key={comment._id} className="d-flex gap-3">
                                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                                    {comment.author?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <strong>{comment.author?.name}</strong>
                                                            <small className="text-muted ms-2">{formatDate(comment.createdAt)}</small>
                                                            {comment.isEdited && <small className="text-muted ms-1">(edited)</small>}
                                                        </div>
                                                        {comment.author?._id === user?.id && (
                                                            <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDeleteComment(comment._id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="mb-0 mt-1">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Time Tracking Tab */}
                        {activeTab === 'time' && (
                            <div>
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body text-center">
                                                <small className="text-muted">Original Estimate</small>
                                                <h5 className="mb-0">{formatTime(task.originalEstimate || 0)}</h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card border-0 bg-primary bg-opacity-10">
                                            <div className="card-body text-center">
                                                <small className="text-muted">Time Spent</small>
                                                <h5 className="mb-0 text-primary">{formatTime(totalTimeLogged)}</h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body text-center">
                                                <small className="text-muted">Remaining</small>
                                                <h5 className="mb-0">{formatTime(Math.max(0, (task.originalEstimate || 0) - totalTimeLogged))}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="mb-3">Log Work</h6>
                                <form onSubmit={handleLogTime} className="mb-4">
                                    <div className="row g-2">
                                        <div className="col-auto">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Hours"
                                                min="0"
                                                value={newTimeLog.hours}
                                                onChange={(e) => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                                                style={{ width: '80px' }}
                                            />
                                        </div>
                                        <div className="col-auto">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Minutes"
                                                min="0"
                                                max="59"
                                                value={newTimeLog.minutes}
                                                onChange={(e) => setNewTimeLog({ ...newTimeLog, minutes: e.target.value })}
                                                style={{ width: '100px' }}
                                            />
                                        </div>
                                        <div className="col">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="What did you work on?"
                                                value={newTimeLog.description}
                                                onChange={(e) => setNewTimeLog({ ...newTimeLog, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-auto">
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                <i className="bi bi-plus-lg me-1"></i>Log
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <h6 className="mb-3">Work Log</h6>
                                {timeLogs.length === 0 ? (
                                    <div className="text-center text-muted py-4">
                                        <i className="bi bi-clock-history fs-3 d-block mb-2"></i>
                                        No time logged yet
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Time</th>
                                                    <th>Description</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {timeLogs.map(log => (
                                                    <tr key={log._id}>
                                                        <td>{log.user?.name}</td>
                                                        <td><strong>{formatTime(log.timeSpent)}</strong></td>
                                                        <td>{log.description || '-'}</td>
                                                        <td className="text-muted small">{formatDate(log.loggedAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
