export type UserRole = 'Staff' | 'Manager' | 'Admin';

export type LeaveType = 'PTO' | 'SICK' | 'COMPASSIONATE' | 'MATERNITY' | 'UNPAID';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'Admin' | 'Manager' | 'Staff';
    department: string;
    position: string;
    profilePicture?: string;
    token?: string;
    leaveBalance: number;
    sickLeaveBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface LeaveRequest {
    id: string;
    userId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    reason?: string;
    status: LeaveStatus;
    documents?: string[];
    createdAt: string;
    updatedAt: string;
    approverId?: string;
    approverComment?: string;
}

export interface LeaveBalance {
    userId: string;
    leaveType: LeaveType;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    carryForwardDays: number;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    read: boolean;
    createdAt: string;
}

export interface PublicHoliday {
    id: string;
    name: string;
    date: string;
    description?: string;
}