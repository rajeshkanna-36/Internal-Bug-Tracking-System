# Internal Bug Tracking System (Project Nexus)

## Overview
This is a full-stack web application designed to help teams track and manage bugs during the software development lifecycle. It provides an organized way for administrators, developers, and testers to collaborate, report issues, and monitor their progress.

I built this project to gain hands-on experience with modern web development, specifically focusing on connecting a React frontend with a Java Spring Boot backend, and implementing secure user authentication.

## Key Features
*   **Kanban Board Dashboard**: A visual drag-and-drop board to track the status of different bugs (e.g., Open, In Progress, Review, Closed).
*   **User Roles & Permissions**: The system supports different roles (Admin, Developer, Tester), ensuring that users only have access to the features (like creating or deleting bugs) they need.
*   **Detailed Bug Reports**: Users can create detailed bug tickets with rich text descriptions, priority levels, and issue types.
*   **Comments & Collaboration**: Team members can leave comments on specific bug tickets to communicate effectively.
*   **Secure Authentication**: Users log in using secure JSON Web Tokens (JWT) to ensure data privacy.

## Tech Stack

### Frontend
*   **React 19 & TypeScript**: Built using Vite for a fast development experience.
*   **Tailwind CSS**: Used for modern, responsive styling and UI design.
*   **React Router**: For navigating between different pages within the application.
*   **Context API**: For managing user authentication state across the app.

### Backend
*   **Java Spring Boot 3**: The core framework used to build the REST API.
*   **Spring Security**: Implements JWT-based authentication and role-based access control.
*   **Spring Data JPA (Hibernate)**: Handles database interactions and maps Java objects to database tables.
*   **PostgreSQL**: The relational database used to store users, bugs, and comments.
*   **Maven**: Used for project dependency management.

## Project Architecture
The project is split into two main parts:
1.  **Frontend (Client)**: A Single Page Application (SPA) that runs in the browser. It communicates with the backend via HTTP requests to fetch or update data.
2.  **Backend (API)**: A stateless RESTful API. Every request from the frontend must include a valid JWT token in the authorization header. The backend verifies this token, checks if the user has the correct role, and then interacts with the PostgreSQL database to fulfill the request.

## How to Run the Project Locally

### Prerequisites
Make sure you have the following installed on your machine:
*   Java 17 or higher
*   Node.js 18 or higher
*   Maven 3.9 or higher
*   PostgreSQL

### Backend Setup
1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Make sure you have a local PostgreSQL instance running. You may need to update the `application.properties` (or equivalent configuration file) with your database credentials.
3. Install dependencies and build the project:
   ```bash
   mvn clean install
   ```
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
The backend API should now be running locally.

### Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary Node packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
The frontend application should now be accessible in your browser (usually at `http://localhost:5173`).

## What I Learned
Through building this project, I gained practical experience in several key areas:
*   **Full-Stack Integration**: Learning how to successfully connect a React application to a Spring Boot API and handle data fetching and Cross-Origin Resource Sharing (CORS).
*   **Security**: Understanding how JWT authentication works, how to store tokens securely, and how to protect specific API endpoints based on user roles.
*   **Database Design**: Designing relational database tables (Users, Bugs, Comments) and managing their relationships using Spring Data JPA.
*   **State Management**: Managing complex UI state, such as drag-and-drop interactions on the Kanban board and global user sessions.