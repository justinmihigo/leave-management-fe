import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { FileText, FileSpreadsheet, UserCog } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  leaveBalance: number;
  sickLeaveBalance: number;
}

const UserRoles: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [leaveBalanceAdjustment, setLeaveBalanceAdjustment] = useState<number>(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const adjustLeaveBalance = async (userId: string, newBalance: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/adjust-leave-balance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newBalance }),
      });
      
      if (!response.ok) throw new Error('Failed to adjust leave balance');
      
      toast.success('Leave balance adjusted successfully');
      await fetchUsers(); // Refresh users data
    } catch (error) {
      console.error('Error adjusting leave balance:', error);
      toast.error('Failed to adjust leave balance');
    }
  };

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/export/users${format=='csv'?'':'/excel'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to export users');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export.${format=='csv'?'csv':'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Users Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Leave Balance Adjustment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                value={selectedUser?.id}
                onValueChange={(value) => setSelectedUser(users.find(u => u.id === value) || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="Adjustment amount"
                value={leaveBalanceAdjustment}
                onChange={(e) => setLeaveBalanceAdjustment(Number(e.target.value))}
              />
              
              <Button
                onClick={() => {
                  if (selectedUser) {
                    adjustLeaveBalance(selectedUser.id, leaveBalanceAdjustment);
                  }
                }}
                className="w-full"
                disabled={!selectedUser || leaveBalanceAdjustment === 0}
              >
                Adjust Balance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => exportData('csv')}
                className="w-full flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Users (CSV)
              </Button>
              <Button
                onClick={() => exportData('excel')}
                className="w-full flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Users (Excel)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Leave Balance</TableHead>
                <TableHead>Sick Leave Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.leaveBalance}</TableCell>
                  <TableCell>{user.sickLeaveBalance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoles;