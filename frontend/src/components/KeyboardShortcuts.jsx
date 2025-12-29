import { useEffect } from 'react';

const KeyboardShortcuts = ({ onSearch }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (onSearch) {
                    onSearch();
                }
            }

            // Escape to close modals (handled by individual components)
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onSearch]);

    return null; // This is a behavior-only component
};

export default KeyboardShortcuts;
