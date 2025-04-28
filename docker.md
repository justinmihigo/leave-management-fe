# Docker Setup for Leave Management System

This document provides information on how to containerize and run the Leave Management System project using Docker.

## About the Project

The Leave Management System is a web-based application designed to streamline the process of managing employee leave requests, approvals, and balances. It provides features such as:

- User authentication and role-based access control.
- Leave application and approval workflows.
- A dashboard for administrators to manage leave requests.
- A team calendar to view leave schedules.
- Historical leave records and balance tracking.

The project is built using modern web technologies, including React for the frontend and Tailwind CSS for styling. It is designed to be scalable and easy to deploy using Docker.

## Prerequisites

- Install [Docker](https://www.docker.com/) on your system.
- Ensure you have the necessary permissions to run Docker commands.

## Dockerfile

The `Dockerfile` is located in the root of the project and is used to build the Docker image for the application. Below is a summary of its contents:

1. **Base Image**: The project uses `node:18-alpine` as the base image.
2. **Working Directory**: The working directory inside the container is set to `/app`.
3. **Dependencies**: The `package.json` and `package-lock.json` files are copied, and dependencies are installed using `npm install`.
4. **Application Code**: The rest of the application code is copied into the container.
5. **Build**: The application is built using `npm run build`.
6. **Port**: The container exposes port `3000`.
7. **Start Command**: The application is started using `npm run preview`.

## .dockerignore

The `.dockerignore` file is used to exclude unnecessary files and directories from the Docker build context. Below is a summary of its contents:

- `node_modules` and `dist` directories
- Git-related files (`.git`, `.gitignore`)
- Development files (`Dockerfile`, `.dockerignore`, `.vscode`)
- Environment files (`.env`)
- Log files (`*.log`)
- TypeScript build info files (`*.tsbuildinfo`)

## Building the Docker Image

To build the Docker image for the project, run the following command in the root of the project:

```bash
docker build -t leave-management-system .
```

## What Happens After Pulling the Image

When the Docker image for the Leave Management System is pulled, it contains everything needed to run the application, including:

1. **Dependencies**: All required Node.js dependencies are pre-installed.
2. **Built Application**: The application is already built and ready to serve.
3. **Exposed Port**: The container is configured to expose port `3000` for the application.

### Running the Pulled Image

To run the pulled image, use the following command:

```bash
docker run -p 3000:3000 leave-management-system
```

This command will:

1. Start the application inside the container.
2. Map port `3000` of the container to port `3000` on your host machine.
3. Serve the application, which can be accessed in your browser at `http://localhost:3000`.

### Notes

- Ensure that port `3000` is not already in use on your host machine.
- If you need to run the container on a different port, modify the `-p` flag, e.g., `-p 8080:3000` to map the container's port `3000` to port `8080` on your host machine.

## Additional Resources

- [Docker Image](https://hub.docker.com/repository/docker/justinmihigo/leave_management)


