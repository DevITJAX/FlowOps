import React, { useState, useEffect } from 'react';
import { projectsAPI, teamsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Team = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', description: '', color: '#6366f1' });
    const [addMemberData, setAddMemberData] = useState({ email: '', role: 'member' });

    const teamColors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
        '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
    ];

    const roleLabels = {
        lead: { label: 'Lead', color: 'warning' },
        developer: { label: 'Developer', color: 'primary' },
        designer: { label: 'Designer', color: 'info' },
        qa: { label: 'QA', color: 'success' },
        devops: { label: 'DevOps', color: 'secondary' },
        member: { label: 'Member', color: 'light' }
    };

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
            const [projectRes, teamsRes] = await Promise.all([
                projectsAPI.getOne(projectId),
                teamsAPI.getByProject(projectId)
            ]);
            setSelectedProject(projectRes.data.data);
            setTeams(teamsRes.data.data);
            setSelectedTeam(null);
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

    const handleSelectTeam = async (team) => {
        setSelectedTeam(team);
        try {
            const res = await teamsAPI.getAvailableUsers(team._id);
            setAvailableUsers(res.data.data);
        } catch (err) {
            console.error('Failed to fetch available users');
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await teamsAPI.create(selectedProjectId, newTeam);
            setNewTeam({ name: '', description: '', color: '#6366f1' });
            setShowCreateModal(false);
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create team');
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!confirm('Are you sure you want to delete this team?')) return;
        try {
            await teamsAPI.delete(teamId);
            setSelectedTeam(null);
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete team');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedTeam) return;
        try {
            await teamsAPI.addMember(selectedTeam._id, addMemberData);
            setAddMemberData({ email: '', role: 'member' });
            setShowAddMemberModal(false);
            // Refresh team data
            const res = await teamsAPI.getOne(selectedTeam._id);
            setSelectedTeam(res.data.data);
            const availRes = await teamsAPI.getAvailableUsers(selectedTeam._id);
            setAvailableUsers(availRes.data.data);
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        }
    };

    const handleQuickAddMember = async (userId, role = 'member') => {
        if (!selectedTeam) return;
        try {
            await teamsAPI.addMember(selectedTeam._id, { userId, role });
            const res = await teamsAPI.getOne(selectedTeam._id);
            setSelectedTeam(res.data.data);
            const availRes = await teamsAPI.getAvailableUsers(selectedTeam._id);
            setAvailableUsers(availRes.data.data);
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!selectedTeam) return;
        if (!confirm('Remove this member from the team?')) return;
        try {
            await teamsAPI.removeMember(selectedTeam._id, userId);
            const res = await teamsAPI.getOne(selectedTeam._id);
            setSelectedTeam(res.data.data);
            const availRes = await teamsAPI.getAvailableUsers(selectedTeam._id);
            setAvailableUsers(availRes.data.data);
            fetchProjectData(selectedProjectId);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (!selectedTeam) return;
        try {
            await teamsAPI.updateMemberRole(selectedTeam._id, userId, { role: newRole });
            const res = await teamsAPI.getOne(selectedTeam._id);
            setSelectedTeam(res.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
        }
    };

    const isOwner = selectedProject?.owner?._id === user?.id || user?.role === 'admin';
    const isTeamLead = selectedTeam?.lead?._id === user?.id;
    const canManageTeam = isOwner || isTeamLead;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="bi bi-people me-2"></i>Teams</h2>
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
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <i className="bi bi-plus-lg me-1"></i>Create Team
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
                    {/* Teams List */}
                    <div className="col-lg-4 mb-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                    <i className="bi bi-collection me-2"></i>
                                    Project Teams
                                    <span className="badge bg-primary ms-2">{teams.length}</span>
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                {teams.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="bi bi-people fs-1 d-block mb-2"></i>
                                        No teams yet
                                        {isOwner && <p className="small mt-2">Create your first team</p>}
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {teams.map(team => (
                                            <button
                                                key={team._id}
                                                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedTeam?._id === team._id ? 'active' : ''}`}
                                                onClick={() => handleSelectTeam(team)}
                                            >
                                                <div className="d-flex align-items-center gap-2">
                                                    <div
                                                        className="rounded-circle"
                                                        style={{
                                                            width: '12px',
                                                            height: '12px',
                                                            backgroundColor: team.color
                                                        }}
                                                    ></div>
                                                    <span>{team.name}</span>
                                                </div>
                                                <span className={`badge ${selectedTeam?._id === team._id ? 'bg-light text-dark' : 'bg-secondary'}`}>
                                                    {team.memberCount || team.members?.length || 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Selected Team Details */}
                    <div className="col-lg-8">
                        {selectedTeam ? (
                            <>
                                {/* Team Header */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    className="rounded d-flex align-items-center justify-content-center text-white fw-bold"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        backgroundColor: selectedTeam.color,
                                                        fontSize: '20px'
                                                    }}
                                                >
                                                    {selectedTeam.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="mb-1">{selectedTeam.name}</h4>
                                                    <p className="text-muted mb-0 small">{selectedTeam.description || 'No description'}</p>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                {canManageTeam && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => setShowAddMemberModal(true)}
                                                    >
                                                        <i className="bi bi-person-plus me-1"></i>Add Member
                                                    </button>
                                                )}
                                                {isOwner && !selectedTeam.isDefault && (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDeleteTeam(selectedTeam._id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {selectedTeam.lead && (
                                            <div className="mt-3 pt-3 border-top">
                                                <small className="text-muted">Team Lead:</small>
                                                <span className="ms-2 fw-medium">{selectedTeam.lead.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Team Members */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white">
                                        <h6 className="mb-0">
                                            <i className="bi bi-people-fill me-2"></i>
                                            Team Members
                                            <span className="badge bg-primary ms-2">{selectedTeam.members?.length || 0}</span>
                                        </h6>
                                    </div>
                                    <div className="card-body p-0">
                                        {!selectedTeam.members || selectedTeam.members.length === 0 ? (
                                            <div className="text-center text-muted py-5">
                                                <i className="bi bi-person-x fs-1 d-block mb-2"></i>
                                                No members in this team yet
                                            </div>
                                        ) : (
                                            <div className="list-group list-group-flush">
                                                {selectedTeam.members.map(member => (
                                                    <div key={member.user._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div
                                                                className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                                                                style={{ width: '40px', height: '40px' }}
                                                            >
                                                                {member.user.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0">{member.user.name}</h6>
                                                                <small className="text-muted">{member.user.email}</small>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {canManageTeam ? (
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={member.role}
                                                                    onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                                                                    style={{ width: 'auto' }}
                                                                >
                                                                    <option value="lead">Lead</option>
                                                                    <option value="developer">Developer</option>
                                                                    <option value="designer">Designer</option>
                                                                    <option value="qa">QA</option>
                                                                    <option value="devops">DevOps</option>
                                                                    <option value="member">Member</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`badge bg-${roleLabels[member.role]?.color || 'secondary'}`}>
                                                                    {roleLabels[member.role]?.label || member.role}
                                                                </span>
                                                            )}
                                                            {canManageTeam && (
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleRemoveMember(member.user._id)}
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

                                {/* Quick Add from Available Users */}
                                {canManageTeam && availableUsers.length > 0 && (
                                    <div className="card border-0 shadow-sm mt-4">
                                        <div className="card-header bg-white">
                                            <h6 className="mb-0">
                                                <i className="bi bi-person-add me-2"></i>Quick Add
                                            </h6>
                                        </div>
                                        <div className="card-body p-0" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            <div className="list-group list-group-flush">
                                                {availableUsers.map(u => (
                                                    <div key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-medium">{u.name}</div>
                                                            <small className="text-muted">{u.email}</small>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleQuickAddMember(u._id)}
                                                        >
                                                            <i className="bi bi-plus-lg"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <i className="bi bi-hand-index fs-1 text-muted d-block mb-3"></i>
                                    <h5 className="text-muted">Select a team to view details</h5>
                                    <p className="text-muted small">Choose a team from the list on the left</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-people me-2"></i>Create Team
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateTeam}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Team Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Backend Team"
                                            value={newTeam.name}
                                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            placeholder="Optional team description"
                                            value={newTeam.description}
                                            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Team Color</label>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {teamColors.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`btn p-0 border-2 ${newTeam.color === color ? 'border-dark' : 'border-transparent'}`}
                                                    style={{ width: '32px', height: '32px', backgroundColor: color, borderRadius: '6px' }}
                                                    onClick={() => setNewTeam({ ...newTeam, color })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="bi bi-plus-lg me-1"></i>Create Team
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-person-plus me-2"></i>Add Team Member
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddMemberModal(false)}></button>
                            </div>
                            <form onSubmit={handleAddMember}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="member@example.com"
                                            value={addMemberData.email}
                                            onChange={(e) => setAddMemberData({ ...addMemberData, email: e.target.value })}
                                            required
                                        />
                                        <small className="text-muted">Enter the email of a registered user</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Role</label>
                                        <select
                                            className="form-select"
                                            value={addMemberData.role}
                                            onChange={(e) => setAddMemberData({ ...addMemberData, role: e.target.value })}
                                        >
                                            <option value="member">Member</option>
                                            <option value="developer">Developer</option>
                                            <option value="designer">Designer</option>
                                            <option value="qa">QA</option>
                                            <option value="devops">DevOps</option>
                                            <option value="lead">Lead</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
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
