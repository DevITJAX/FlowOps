import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="d-flex">
            <div className="sidebar d-flex flex-column p-3">
                <h3 className="mb-4 text-center">
                    <i className="bi bi-layers-half me-2"></i>FlowOps
                </h3>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <Link to="/" className={`nav-link ${isActive('/')}`}>
                            <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/projects" className={`nav-link ${isActive('/projects')}`}>
                            <i className="bi bi-folder me-2"></i> Projects
                        </Link>
                    </li>
                    <li>
                        <Link to="/backlog" className={`nav-link ${isActive('/backlog')}`}>
                            <i className="bi bi-list-ul me-2"></i> Backlog
                        </Link>
                    </li>
                    <li>
                        <Link to="/tasks" className={`nav-link ${isActive('/tasks')}`}>
                            <i className="bi bi-kanban me-2"></i> Board
                        </Link>
                    </li>
                    <li>
                        <Link to="/team" className={`nav-link ${isActive('/team')}`}>
                            <i className="bi bi-people me-2"></i> Team
                        </Link>
                    </li>
                    <li>
                        <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>
                            <i className="bi bi-graph-up me-2"></i> Reports
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className={`nav-link ${isActive('/settings')}`}>
                            <i className="bi bi-gear me-2"></i> Settings
                        </Link>
                    </li>
                </ul>
                <hr />
                <div className="dropdown">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{user?.name}</strong>
                            <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>{user?.role?.replace('_', ' ')}</small>
                        </div>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                        <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item" onClick={handleLogout}>Sign out</button></li>
                    </ul>
                </div>
            </div>
            <div className="main-wrapper w-100">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
