import React from 'react';

const Notification: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
    return (
        <div className={`notification ${type}`}>
            {message}
        </div>
    );
};

export default Notification;