import { User } from '../types';

interface UserRolesProps {
  user: User;
  onRoleChange: (userId: string, newRole: User['role']) => void;
}

export const UserRoles: React.FC<UserRolesProps> = ({ user, onRoleChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <select
        value={user.role}
        onChange={(e) => onRoleChange(user.id, e.target.value as User['role'])}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="employee">Employee</option>
      </select>
    </div>
  );
}; 