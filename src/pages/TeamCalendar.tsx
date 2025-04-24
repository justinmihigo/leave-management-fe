import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { LeaveRequest, User } from '../types';

interface LeaveWithUser extends LeaveRequest {
  user?: User;
}

const TeamCalendar: React.FC = () => {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState<LeaveWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLeaves = async () => {
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/admin/leaves', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team leaves');
        }

        const data = await response.json();

        // Fetch user names for each leave
        const leavesWithNames = await Promise.all(
          data.map(async (leave: LeaveWithUser) => {
            try {
              const userResponse = await fetch(`http://localhost:8080/api/users/${leave.userId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (userResponse.ok) {
                const userData = await userResponse.json();
                return { ...leave, user: userData };
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
        console.error('Error fetching team leaves:', error);
        toast.error('Failed to fetch team calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllLeaves();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group leaves by month
  const groupLeavesByMonth = (leaves: LeaveWithUser[]) => {
    const grouped = leaves.reduce((acc, leave) => {
      const startDate = new Date(leave.startDate);
      const monthYear = startDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(leave);
      return acc;
    }, {} as Record<string, LeaveWithUser[]>);

    // Sort leaves within each month by start date
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    });

    return grouped;
  };

  const groupedLeaves = groupLeavesByMonth(leaves);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Calendar</h1>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading team calendar...</div>
              </CardContent>
            </Card>
          ) : leaves.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">No leave requests found</div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedLeaves).map(([monthYear, monthLeaves]) => (
              <Card key={monthYear}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{monthYear}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">{leave.user?.name || leave.userId}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{leave.leaveType}</p>
                              {leave.reason && (
                                <p className="text-sm text-gray-500">
                                  {leave.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {leave.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statistics</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Total Leaves</p>
                <p className="text-2xl font-bold">{leaves.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Approved Leaves</p>
                <p className="text-2xl font-bold">
                  {leaves.filter(leave => leave.status.toLowerCase() === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamCalendar;