import React, { useState, useEffect } from 'react';
import { fetchUserRoles, updateUserRole } from '../utils/api';

const UserRoles: React.FC = () => {
    const [roles, setRoles] = useState<{ id: number; name: string; role: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const fetchedRoles = await fetchUserRoles();
                setRoles(fetchedRoles);
            } catch (err) {
                console.error('Error fetching user roles:', err);
                setError('Failed to load user roles. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadRoles();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            setRoles((prevRoles) =>
                prevRoles.map((role) =>
                    role.id === userId ? { ...role, role: newRole } : role
                )
            );
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Failed to update user role. Please try again later.');
        }
    };

    if (loading) {
        return <div>Loading user roles...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h2>User Roles Management</h2>
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Current Role</th>
                        <th>Change Role</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map((role) => (
                        <tr key={role.id}>
                            <td>{role.id}</td>
                            <td>{role.name}</td>
                            <td>{role.role}</td>
                            <td>
                                <select
                                    value={role.role}
                                    onChange={(e) => handleRoleChange(role.id, e.target.value)}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserRoles;