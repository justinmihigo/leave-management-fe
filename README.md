# Leave Management System

This is a Leave Management System built with React and TypeScript. The application allows employees to manage their leave requests, view their leave balances, and provides an admin panel for HR functionalities.

## Features

- Employee Dashboard: Overview of leave balance, application history, and upcoming public holidays.
- Leave Applications: Form for employees to apply for leave with options for leave type and duration.
- Leave Approval Workflows: Managers can review and approve or reject leave applications.
- Leave Balance Management: Displays accrued and used leave days for users.
- Admin/HR Panel: Manage leave types, accrual rates, and generate reports.
- Team Calendars: View of team members' leave schedules and upcoming public holidays.
- Notifications: Alerts for leave application status updates.
- User Roles and Permissions: Manage user roles within the application.
- Microsoft Authenticator Integration: Secure authentication for users.

## Project Structure

```
leave-management-system
├── src
│   ├── components
│   │   ├── Header.tsx          # Navigation bar component
│   │   ├── Footer.tsx          # Footer component
│   │   ├── Sidebar.tsx         # Side navigation menu
│   │   └── Notification.tsx     # Notification display component
│   ├── pages
│   │   ├── Dashboard.tsx       # Employee dashboard
│   │   ├── LeaveApplication.tsx # Form for applying for leave
│   │   ├── LeaveApproval.tsx    # Review and approval of leave applications
│   │   ├── LeaveBalance.tsx     # Display leave balance
│   │   ├── AdminPanel.tsx       # HR functionalities
│   │   ├── TeamCalendar.tsx      # Team leave calendar
│   │   └── UserRoles.tsx        # Manage user roles and permissions
│   ├── auth
│   │   └── MicrosoftAuth.tsx    # Microsoft authentication
│   ├── utils
│   │   └── api.ts               # API utility functions
│   ├── types
│   │   └── index.ts             # Type definitions
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # Entry point of the application
│   └── styles
│       └── global.css           # Global styles
├── public
│   ├── index.html               # Main HTML file
├── package.json                 # npm configuration file
├── tsconfig.json                # TypeScript configuration file
└── README.md                    # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/leave-management-system.git
   ```
2. Navigate to the project directory:
   ```
   cd leave-management-system
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```
This will launch the application in your default web browser.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License

This project is licensed under the MIT License.