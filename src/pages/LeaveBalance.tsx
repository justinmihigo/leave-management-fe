import React from 'react';

const LeaveBalance: React.FC = () => {
    // Sample data for leave balance
    const leaveBalance = {
        totalLeave: 20,
        usedLeave: 5,
        remainingLeave: 15,
    };

    return (
        <div>
            <h2>Your Leave Balance</h2>
            <div>
                <p>Total Leave Days: {leaveBalance.totalLeave}</p>
                <p>Used Leave Days: {leaveBalance.usedLeave}</p>
                <p>Remaining Leave Days: {leaveBalance.remainingLeave}</p>
            </div>
        </div>
    );
};

export default LeaveBalance;