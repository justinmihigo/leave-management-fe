import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

interface Leave {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: string;
  reason: string;
}

const Dashboard: React.FC = () => {
  const { user, getUserLeaves } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    if (!user) {
      toast.error('User not authenticated');
      history.push('/login');
      return;
    }

    if (user.role != 'Staff') {
      history.push('/not-authorized');
      return;
    }
    else{
      history.push('/dashboard');
    }

    const fetchLeaves = async () => {
      try {
        const userLeaves = await getUserLeaves();
        setLeaves(userLeaves);
      } catch (error) {
        toast.error('Failed to fetch leave data');
        console.error('Error fetching leaves:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [user, getUserLeaves, history]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name ?? 'User'}</h1>
        <Link to="/leave/apply">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Annual Leave</span>
              <span className="font-medium">{user?.leaveBalance || 0} days</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Sick Leave</span>
              <span className="font-medium">{user?.sickLeaveBalance || 0} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : leaves.length > 0 ? (
              leaves.slice(0, 2).map((leave) => (
                <div key={leave.id} className="flex justify-between items-center mb-2">
                  <span className="text-sm">{leave.leaveType}</span>
                  <span className={`text-sm ${getStatusColor(leave.status)}`}>
                    {leave.status.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-500">No leave requests yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/leave/history">
                <Button variant="outline" className="w-full justify-start">
                  View Leave History
                </Button>
              </Link>
              <Link to="/team-calendar">
                <Button variant="outline" className="w-full justify-start">
                  Team Calendar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;