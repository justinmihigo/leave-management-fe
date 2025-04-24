import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Users,
  FileSpreadsheet,
  FileText,
  Calendar,
  UserCog,
  FilePieChart,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  leaveBalance: number;
  sickLeaveBalance: number;
}

interface Leave {
  id: string;
  userId: string;
  userName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

const AdminDashboard: React.FC = () => {
  const history = useHistory();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [leaveBalanceAdjustment, setLeaveBalanceAdjustment] = useState<number>(0);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    console.log("admin role", user?.role);
    if (user?.role !== 'Admin') {
      history.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, history]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchUsers(), fetchLeaves()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchLeaves = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch leaves');
      const data = await response.json();

      // Fetch user names for each leave
      const leavesWithNames = await Promise.all(
        data.map(async (leave: Leave) => {
          try {
            const userResponse = await fetch(`http://localhost:8080/api/users/${leave.userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              return { ...leave, userName: userData.name };
            } else {
              console.error(`Failed to fetch user data for ID: ${leave.userId}`);
              return leave;
            }
          } catch (error) {
            console.error(`Error fetching user data for ID: ${leave.userId}`, error);
            return leave;
          }
        })
      );

      setLeaves(leavesWithNames);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leaves');
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

  const exportData = async (type: 'users' | 'leaves', format: 'csv' | 'excel') => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/export/${type}${format=='csv'?'':'/excel'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error(`Failed to export ${type}`);
      
      const blob = await response.blob();
      console.log(blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export.${format=='csv'?'csv':'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${type} exported successfully`);
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast.error(`Failed to export ${type}`);
    }
  };

  const generateReport = async (type: 'department' | 'leave-type', value: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/report/${type}?${type}=${value}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error(`Failed to generate ${type} report`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${type} report generated successfully`);
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      toast.error(`Failed to generate ${type} report`);
    }
  };

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!selectedLeave) return;

    try {
      const endpoint =
        status === 'Approved'
          ? `http://localhost:8080/api/leaves/${selectedLeave.id}/approve`
          : `http://localhost:8080/api/leaves/${selectedLeave.id}/reject`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: comment }),
      });

      if (!response.ok) throw new Error(`Failed to ${status.toLowerCase()} leave`);

      toast.success(`Leave ${status.toLowerCase()} successfully`);
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === selectedLeave.id ? { ...leave, status } : leave
        )
      );
      setSelectedLeave(null);
      setComment('');
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing leave:`, error);
      toast.error(`Failed to ${status.toLowerCase()} leave`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Leaves Table */}
      <Card className="mt-6 mb-6">
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.userName}</TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' : leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :'bg-red-100 text-red-800'
                    }`}>
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    {leave.status === 'Pending' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLeave(leave)}
                          >
                            Take Action
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Take Action on Leave</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>
                              <strong>Employee:</strong> {leave.userName}
                            </p>
                            <p>
                              <strong>Leave Type:</strong> {leave.leaveType}
                            </p>
                            <p>
                              <strong>Reason:</strong> {leave.reason}
                            </p>
                            <Input
                              type="text"
                              placeholder="Add comments"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handleAction('Approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleAction('Rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => exportData('users', 'csv')}
                className="w-full flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Users (CSV)
              </Button>
              <Button
                onClick={() => exportData('users', 'excel')}
                className="w-full flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Users (Excel)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leave Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => exportData('leaves', 'csv')}
                className="w-full flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Leaves (CSV)
              </Button>
              <Button
                onClick={() => exportData('leaves', 'excel')}
                className="w-full flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export Leaves (Excel)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePieChart className="h-5 w-5" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateReport('department', selectedDepartment)}
                  className="w-full mt-2"
                  disabled={!selectedDepartment}
                >
                  Generate Department Report
                </Button>
              </div>

              <div>
                <Select
                  value={selectedLeaveType}
                  onValueChange={setSelectedLeaveType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateReport('leave-type', selectedLeaveType)}
                  className="w-full mt-2"
                  disabled={!selectedLeaveType}
                >
                  Generate Leave Type Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance Adjustment Card */}
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
      </div>

      {/* Users Table */}
      <Card className="mt-6">
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

export default AdminDashboard;