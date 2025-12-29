import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ tasks: [], projects: [], users: [] });
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const res = await api.get(`/search?q=${encodeURIComponent(query)}&limit=5`);
                    setResults(res.data.data);
                    setShowResults(true);
                } catch (err) {
                    console.error('Search error:', err);
                }
                setLoading(false);
            } else {
                setResults({ tasks: [], projects: [], users: [] });
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [query]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowResults(false);
            setQuery('');
        }
    };

    const totalResults = results.tasks.length + results.projects.length + results.users.length;

    return (
        <div className="position-relative" ref={searchRef} style={{ width: '300px' }}>
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                    <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-search'}`}></i>
                </span>
                <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search tasks, projects... (Ctrl+K)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {showResults && (
                <div className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg" style={{ zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}>
                    {totalResults === 0 && !loading && (
                        <div className="p-3 text-center text-muted">
                            <i className="bi bi-search me-2"></i>
                            No results found for "{query}"
                        </div>
                    )}

                    {results.tasks.length > 0 && (
                        <div className="border-bottom">
                            <div className="px-3 py-2 bg-light small fw-bold text-muted">
                                <i className="bi bi-list-task me-2"></i>Tasks
                            </div>
                            {results.tasks.map(task => (
                                <Link
                                    key={task._id}
                                    to={`/tasks?task=${task._id}`}
                                    className="d-block px-3 py-2 text-decoration-none text-dark border-bottom"
                                    onClick={() => setShowResults(false)}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-secondary small">{task.taskKey}</span>
                                        <span className="text-truncate">{task.title}</span>
                                    </div>
                                    <small className="text-muted">{task.project?.name}</small>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.projects.length > 0 && (
                        <div className="border-bottom">
                            <div className="px-3 py-2 bg-light small fw-bold text-muted">
                                <i className="bi bi-folder me-2"></i>Projects
                            </div>
                            {results.projects.map(project => (
                                <Link
                                    key={project._id}
                                    to={`/projects?project=${project._id}`}
                                    className="d-block px-3 py-2 text-decoration-none text-dark border-bottom"
                                    onClick={() => setShowResults(false)}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-primary small">{project.key}</span>
                                        <span>{project.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {results.users.length > 0 && (
                        <div>
                            <div className="px-3 py-2 bg-light small fw-bold text-muted">
                                <i className="bi bi-people me-2"></i>Users
                            </div>
                            {results.users.map(user => (
                                <div
                                    key={user._id}
                                    className="d-block px-3 py-2 text-dark border-bottom"
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                        <small className="text-muted">{user.email}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
