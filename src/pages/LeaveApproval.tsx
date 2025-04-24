import React, { useEffect, useState } from 'react';
import { LeaveRequest, LeaveStatus } from '../types';
import { fetchLeaveRequests, updateLeaveRequestStatus } from '../utils/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'react-toastify';

const LeaveApproval: React.FC = () => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<{ [key: string]: string }>({}); // Track comments for each leave request

    useEffect(() => {
        const loadLeaveRequests = async () => {
            try {
                 // Debugging
                const requests = await fetchLeaveRequests();
                console.log('Fetched leave requests:', requests); // Debugging
                setLeaveRequests(requests);

            } catch (error) {
                toast.error('Failed to load leave requests');
                console.error('Error loading leave requests:', error);
            } finally {
                setLoading(false);
                console.log('leave requests:', leaveRequests);
            }
        };

        loadLeaveRequests();
    }, []);

    const handleApproval = async (id: string, status: LeaveStatus) => {
        try {
            const comment = comments[id] || ''; // Get the comment for the specific leave request
            await updateLeaveRequestStatus(id, status, { comments: comment });
            setLeaveRequests(leaveRequests.filter(request => request.id !== id));
            toast.success(`Leave request ${status.toLowerCase()}`);
        } catch (error) {
            toast.error('Failed to update leave request status');
            console.error('Error updating leave request:', error);
        }
    };

    const handleCommentChange = (id: string, value: string) => {
        setComments((prev) => ({ ...prev, [id]: value }));
    };

    if (loading) {
        return <div className="text-center py-8">Loading leave requests...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Leave Approval</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Leave Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Comments</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveRequests.map(request => (
                                <TableRow key={request.status}>
                                    <TableCell>{request.userId}</TableCell>
                                    <TableCell>{request.leaveType}</TableCell>
                                    <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{request.reason}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-sm ${
                                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {request.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <textarea
                                            className="border rounded p-1 w-full"
                                            placeholder="Add comments"
                                            value={comments[request.id] || ''}
                                            onChange={(e) => handleCommentChange(request.id, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        
                                        {request.status === 'Pending' && (
                                            <div className="flex space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="bg-green-500 text-white hover:bg-green-600"
                                                    onClick={() => handleApproval(request.id, 'Approved')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="bg-red-500 text-white hover:bg-red-600"
                                                    onClick={() => handleApproval(request.id, 'Rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveApproval;