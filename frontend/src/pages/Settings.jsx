import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';

const Settings = () => {
    const { user } = useAuth();
    const { success, error } = useToast();

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);

        try {
            await authAPI.updateProfile(profileForm);
            success('Profile updated successfully!');
        } catch (err) {
            error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            error('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            error('New password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);

        try {
            await authAPI.updatePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            success('Password changed successfully!');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Settings</h2>
                    <p className="text-muted mb-0">Manage your account preferences</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Profile Settings */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0">
                                <i className="bi bi-person-circle me-2"></i>
                                Profile Information
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleProfileSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={profileForm.name}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={profileForm.email}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user?.role?.replace('_', ' ').toUpperCase() || ''}
                                        disabled
                                    />
                                    <div className="form-text">Role cannot be changed</div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={profileLoading}
                                >
                                    {profileLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Password Settings */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0">
                                <i className="bi bi-shield-lock me-2"></i>
                                Change Password
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-warning"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-key me-2"></i>
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                Account Information
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <p className="text-muted mb-1">User ID</p>
                                    <p className="fw-medium font-monospace small">{user?.id}</p>
                                </div>
                                <div className="col-md-4">
                                    <p className="text-muted mb-1">Account Status</p>
                                    <span className="badge bg-success">Active</span>
                                </div>
                                <div className="col-md-4">
                                    <p className="text-muted mb-1">Role</p>
                                    <span className="badge bg-primary">{user?.role?.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
