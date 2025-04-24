import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    <li><Link to="/">Dashboard</Link></li>
                    <li><Link to="/leave-application">Leave Application</Link></li>
                    <li><Link to="/leave-approval">Leave Approval</Link></li>
                    <li><Link to="/leave-balance">Leave Balance</Link></li>
                    <li><Link to="/admin-panel">Admin Panel</Link></li>
                    <li><Link to="/team-calendar">Team Calendar</Link></li>
                    <li><Link to="/user-roles">User Roles</Link></li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;