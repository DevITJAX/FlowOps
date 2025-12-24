import React, { useState, useEffect } from 'react';
import { commentsAPI, timelogsAPI, issueLinksAPI, attachmentsAPI, tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TaskDetailModal = ({ task, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('details');
    const [comments, setComments] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [links, setLinks] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newTimeLog, setNewTimeLog] = useState({ hours: '', minutes: '', description: '' });
    const [newLink, setNewLink] = useState({ targetTaskId: '', linkType: 'relates_to' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (task) {
            loadComments();
            loadTimeLogs();
            loadLinks();
            loadAttachments();
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

    const loadLinks = async () => {
        try {
            const res = await issueLinksAPI.getByTask(task._id);
            setLinks(res.data.data);
        } catch (err) {
            console.error('Failed to load links');
        }
    };

    const loadAttachments = async () => {
        try {
            const res = await attachmentsAPI.getByTask(task._id);
            setAttachments(res.data.data);
        } catch (err) {
            console.error('Failed to load attachments');
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

    const handleAddLink = async (e) => {
        e.preventDefault();
        if (!newLink.targetTaskId) return;
        setLoading(true);
        try {
            await issueLinksAPI.create(task._id, newLink);
            setNewLink({ targetTaskId: '', linkType: 'relates_to' });
            loadLinks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create link');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLink = async (linkId) => {
        try {
            await issueLinksAPI.delete(linkId);
            loadLinks();
        } catch (err) {
            console.error('Failed to delete link');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await attachmentsAPI.upload(task._id, formData);
            loadAttachments();
            e.target.value = '';
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        try {
            await attachmentsAPI.delete(attachmentId);
            loadAttachments();
        } catch (err) {
            console.error('Failed to delete attachment');
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
        highest: 'danger', high: 'danger', medium: 'warning', low: 'info', lowest: 'secondary'
    };

    const linkTypeLabels = {
        blocks: 'blocks', is_blocked_by: 'is blocked by', relates_to: 'relates to',
        duplicates: 'duplicates', is_duplicated_by: 'is duplicated by',
        clones: 'clones', is_cloned_by: 'is cloned by'
    };

    const getFileIcon = (mimetype) => {
        if (mimetype.startsWith('image/')) return 'bi-file-image text-success';
        if (mimetype.includes('pdf')) return 'bi-file-pdf text-danger';
        if (mimetype.includes('word') || mimetype.includes('document')) return 'bi-file-word text-primary';
        if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'bi-file-excel text-success';
        if (mimetype.includes('zip') || mimetype.includes('rar')) return 'bi-file-zip text-warning';
        return 'bi-file-earmark text-secondary';
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
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
                        <ul className="nav nav-tabs mb-3">
                            {['details', 'comments', 'time', 'links', 'attachments'].map(tab => (
                                <li key={tab} className="nav-item">
                                    <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                                        <i className={`bi bi-${tab === 'details' ? 'info-circle' : tab === 'comments' ? 'chat-dots' : tab === 'time' ? 'clock' : tab === 'links' ? 'link-45deg' : 'paperclip'} me-1`}></i>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {tab === 'comments' && comments.length > 0 && <span className="badge bg-secondary ms-1">{comments.length}</span>}
                                        {tab === 'attachments' && attachments.length > 0 && <span className="badge bg-secondary ms-1">{attachments.length}</span>}
                                    </button>
                                </li>
                            ))}
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
                                            <span className={`badge bg-${task.status === 'done' ? 'success' : task.status === 'doing' ? 'primary' : 'secondary'}`}>{task.status}</span>
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div>
                                <form onSubmit={handleAddComment} className="mb-4">
                                    <div className="input-group">
                                        <input type="text" className="form-control" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                        <button className="btn btn-primary" type="submit" disabled={loading}><i className="bi bi-send"></i></button>
                                    </div>
                                </form>
                                <div className="d-flex flex-column gap-3">
                                    {comments.length === 0 ? (
                                        <div className="text-center text-muted py-4"><i className="bi bi-chat-dots fs-3 d-block mb-2"></i>No comments yet</div>
                                    ) : comments.map(comment => (
                                        <div key={comment._id} className="d-flex gap-3">
                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '36px', height: '36px', flexShrink: 0 }}>{comment.author?.name?.charAt(0).toUpperCase()}</div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div><strong>{comment.author?.name}</strong><small className="text-muted ms-2">{formatDate(comment.createdAt)}</small></div>
                                                    {comment.author?._id === user?.id && <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleDeleteComment(comment._id)}><i className="bi bi-trash"></i></button>}
                                                </div>
                                                <p className="mb-0 mt-1">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Time Tracking Tab */}
                        {activeTab === 'time' && (
                            <div>
                                <div className="row mb-4">
                                    <div className="col-md-4"><div className="card border-0 bg-light"><div className="card-body text-center"><small className="text-muted">Original Estimate</small><h5 className="mb-0">{formatTime(task.originalEstimate || 0)}</h5></div></div></div>
                                    <div className="col-md-4"><div className="card border-0 bg-primary bg-opacity-10"><div className="card-body text-center"><small className="text-muted">Time Spent</small><h5 className="mb-0 text-primary">{formatTime(totalTimeLogged)}</h5></div></div></div>
                                    <div className="col-md-4"><div className="card border-0 bg-light"><div className="card-body text-center"><small className="text-muted">Remaining</small><h5 className="mb-0">{formatTime(Math.max(0, (task.originalEstimate || 0) - totalTimeLogged))}</h5></div></div></div>
                                </div>
                                <form onSubmit={handleLogTime} className="mb-4">
                                    <div className="row g-2">
                                        <div className="col-auto"><input type="number" className="form-control" placeholder="Hours" min="0" value={newTimeLog.hours} onChange={(e) => setNewTimeLog({ ...newTimeLog, hours: e.target.value })} style={{ width: '80px' }} /></div>
                                        <div className="col-auto"><input type="number" className="form-control" placeholder="Min" min="0" max="59" value={newTimeLog.minutes} onChange={(e) => setNewTimeLog({ ...newTimeLog, minutes: e.target.value })} style={{ width: '80px' }} /></div>
                                        <div className="col"><input type="text" className="form-control" placeholder="Description" value={newTimeLog.description} onChange={(e) => setNewTimeLog({ ...newTimeLog, description: e.target.value })} /></div>
                                        <div className="col-auto"><button type="submit" className="btn btn-primary" disabled={loading}><i className="bi bi-plus-lg"></i> Log</button></div>
                                    </div>
                                </form>
                                {timeLogs.length > 0 && (
                                    <table className="table table-sm">
                                        <thead><tr><th>User</th><th>Time</th><th>Description</th><th>Date</th></tr></thead>
                                        <tbody>{timeLogs.map(log => (<tr key={log._id}><td>{log.user?.name}</td><td><strong>{formatTime(log.timeSpent)}</strong></td><td>{log.description || '-'}</td><td className="text-muted small">{formatDate(log.loggedAt)}</td></tr>))}</tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Links Tab */}
                        {activeTab === 'links' && (
                            <div>
                                <form onSubmit={handleAddLink} className="mb-4">
                                    <div className="row g-2">
                                        <div className="col-auto">
                                            <select className="form-select" value={newLink.linkType} onChange={(e) => setNewLink({ ...newLink, linkType: e.target.value })}>
                                                <option value="relates_to">relates to</option>
                                                <option value="blocks">blocks</option>
                                                <option value="is_blocked_by">is blocked by</option>
                                                <option value="duplicates">duplicates</option>
                                                <option value="clones">clones</option>
                                            </select>
                                        </div>
                                        <div className="col"><input type="text" className="form-control" placeholder="Target Task ID" value={newLink.targetTaskId} onChange={(e) => setNewLink({ ...newLink, targetTaskId: e.target.value })} /></div>
                                        <div className="col-auto"><button type="submit" className="btn btn-primary" disabled={loading}><i className="bi bi-link-45deg"></i> Link</button></div>
                                    </div>
                                </form>
                                {links.length === 0 ? (
                                    <div className="text-center text-muted py-4"><i className="bi bi-link-45deg fs-3 d-block mb-2"></i>No linked issues</div>
                                ) : (
                                    <div className="list-group">
                                        {links.map(link => (
                                            <div key={link._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="text-muted me-2">{linkTypeLabels[link.linkType]}</span>
                                                    <i className={`bi ${issueTypeIcons[link.linkedTask?.type] || 'bi-check2-square'} me-1`}></i>
                                                    <strong>{link.linkedTask?.taskKey}</strong>
                                                    <span className="ms-2">{link.linkedTask?.title}</span>
                                                    <span className={`badge bg-${link.linkedTask?.status === 'done' ? 'success' : 'secondary'} ms-2`}>{link.linkedTask?.status}</span>
                                                </div>
                                                <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteLink(link._id)}><i className="bi bi-x-lg"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Attachments Tab */}
                        {activeTab === 'attachments' && (
                            <div>
                                <div className="mb-4">
                                    <label className="btn btn-outline-primary">
                                        <i className="bi bi-upload me-2"></i>{uploading ? 'Uploading...' : 'Upload File'}
                                        <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                    <small className="text-muted ms-2">Max 10MB. Images, PDFs, Office docs, ZIP files.</small>
                                </div>
                                {attachments.length === 0 ? (
                                    <div className="text-center text-muted py-4"><i className="bi bi-paperclip fs-3 d-block mb-2"></i>No attachments</div>
                                ) : (
                                    <div className="list-group">
                                        {attachments.map(att => (
                                            <div key={att._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3">
                                                    <i className={`bi ${getFileIcon(att.mimetype)} fs-4`}></i>
                                                    <div>
                                                        <a href={attachmentsAPI.download(att._id)} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-medium">{att.originalName}</a>
                                                        <div className="text-muted small">{att.formattedSize} • Uploaded by {att.uploadedBy?.name} • {formatDate(att.createdAt)}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <a href={attachmentsAPI.download(att._id)} className="btn btn-sm btn-outline-primary me-1"><i className="bi bi-download"></i></a>
                                                    {att.uploadedBy?._id === user?.id && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAttachment(att._id)}><i className="bi bi-trash"></i></button>}
                                                </div>
                                            </div>
                                        ))}
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
