import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Team = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addEmail, setAddEmail] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await projectsAPI.getAll();
            setProjects(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedProjectId(res.data.data[0]._id);
                fetchProjectData(res.data.data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch projects');
        }
    };

    const fetchProjectData = async (projectId) => {
        setLoading(true);
        try {
            const [projectRes, membersRes, availableRes] = await Promise.all([
                projectsAPI.getOne(projectId),
                projectsAPI.getMembers(projectId),
                projectsAPI.getAvailableUsers(projectId)
            ]);
            setSelectedProject(projectRes.data.data);
            setMembers(membersRes.data.data);
            setAvailableUsers(availableRes.data.data);
        } catch (err) {
            console.error('Failed to fetch project data');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (projectId) => {
        setSelectedProjectId(projectId);
        fetchProjectData(projectId);
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await projectsAPI.addMember(selectedProjectId, { email: addEmail });
            setAddEmail('');
            setShowAddModal(false);
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        }
    };

    const handleAddFromList = async (userId) => {
        try {
            await projectsAPI.addMember(selectedProjectId, { userId });
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Remove this member from the project?')) return;
        try {
            await projectsAPI.removeMember(selectedProjectId, userId);
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const isOwner = selectedProject?.owner?._id === user?.id || user?.role === 'admin';

    const getRoleBadge = (member) => {
        if (member.role === 'owner' || member._id === selectedProject?.owner?._id) {
            return <span className="badge bg-warning text-dark">Owner</span>;
        }
        return <span className="badge bg-secondary">Member</span>;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="bi bi-people me-2"></i>Team</h2>
                <div className="d-flex gap-2">
                    <select
                        className="form-select w-auto"
                        value={selectedProjectId}
                        onChange={(e) => handleProjectChange(e.target.value)}
                    >
                        {projects.length === 0 && <option>No projects</option>}
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    {isOwner && (
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <i className="bi bi-person-plus me-1"></i>Add Member
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="row">
                    {/* Team Members */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <i className="bi bi-people-fill me-2"></i>
                                    Project Team
                                    <span className="badge bg-primary ms-2">{members.length}</span>
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                {members.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="bi bi-people fs-1 d-block mb-2"></i>
                                        No team members yet
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {members.map(member => (
                                            <div key={member._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '45px', height: '45px' }}>
                                                        {member.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{member.name}</h6>
                                                        <small className="text-muted">{member.email}</small>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    {getRoleBadge(member)}
                                                    {isOwner && member._id !== selectedProject?.owner?._id && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleRemoveMember(member._id)}
                                                        >
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Available Users */}
                    {isOwner && (
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white">
                                    <h6 className="mb-0">
                                        <i className="bi bi-person-add me-2"></i>Quick Add
                                    </h6>
                                </div>
                                <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {availableUsers.length === 0 ? (
                                        <div className="text-center text-muted py-4">
                                            <small>No more users available</small>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {availableUsers.map(u => (
                                                <div key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-medium">{u.name}</div>
                                                        <small className="text-muted">{u.email}</small>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleAddFromList(u._id)}
                                                    >
                                                        <i className="bi bi-plus-lg"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-person-plus me-2"></i>Add Team Member
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <form onSubmit={handleAddMember}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="member@example.com"
                                            value={addEmail}
                                            onChange={(e) => setAddEmail(e.target.value)}
                                            required
                                        />
                                        <small className="text-muted">Enter the email of a registered user</small>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="bi bi-person-plus me-1"></i>Add Member
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

export default Team;
