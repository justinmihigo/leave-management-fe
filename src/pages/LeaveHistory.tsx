import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { FileText, FileSpreadsheet, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

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

const LeaveHistory: React.FC = () => {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

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

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/export/leaves${format=='csv'?'':'/excel'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to export leaves');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaves-export.${format=='csv'?'csv':'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Leaves exported successfully');
    } catch (error) {
      console.error('Error exporting leaves:', error);
      toast.error('Failed to export leaves');
    }
  };

  // Calculate statistics
  const totalLeaves = leaves.length;
  const approvedLeaves = leaves.filter(leave => leave.status === 'Approved').length;
  const pendingLeaves = leaves.filter(leave => leave.status === 'Pending').length;
  const rejectedLeaves = leaves.filter(leave => leave.status === 'Rejected').length;
  const uniqueEmployees = new Set(leaves.map(leave => leave.userId)).size;
  const averageLeaveDuration = leaves.reduce((acc, leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return acc + diffDays;
  }, 0) / totalLeaves || 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Leave History</h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeaves}</div>
            <p className="text-xs text-muted-foreground">
              {uniqueEmployees} unique employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageLeaveDuration.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">
              per leave request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Approved</span>
                </div>
                <span className="text-sm font-medium">{approvedLeaves}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium">{pendingLeaves}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm">Rejected</span>
                </div>
                <span className="text-sm font-medium">{rejectedLeaves}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Leaves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => exportData('csv')}
              className="w-full flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Leaves (CSV)
            </Button>
            <Button
              onClick={() => exportData('excel')}
              className="w-full flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Leaves (Excel)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leaves</CardTitle>
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
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                      leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell>{leave.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveHistory; 