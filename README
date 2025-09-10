📌 To-Do App (MERN Stack)

A full-stack To-Do application built using MongoDB, Express.js, React, and Node.js (MERN).
This project demonstrates authentication with JWT, role-based access (Admin/User), CRUD operations on tasks, and data visualization in the dashboard.

🚀 Deployment Links

Frontend (Netlify): https://todo-frontend-mcjo.netlify.app/

Backend (Render): https://todo-backend-mcjo.onrender.com/

🖼️ Screenshots
🔐 Authentication

Login Page

Register Page

📋 Task Management

Add, Edit, Delete tasks

Tasks listed in descending order (newest on top)

📊 Dashboard (Admin Only)

Task Status Distribution (Pie Chart)

Task Priority Distribution (Bar Chart)

Task Due Trends (Area Chart for last 14 days)

🛠️ Tech Stack

Frontend: React, Tailwind CSS, Axios, React Router

Backend: Node.js, Express.js, MongoDB, JWT (jsonwebtoken), bcrypt

Charts: Recharts

Authentication: JWT-based with role handling (admin/user)

Deployment: Netlify (Frontend), Render (Backend)

✨ Features

🔑 User Authentication – Register/Login using JWT

👥 Role-Based Access – User & Admin dashboards

✅ Task Management – Create, Update, Delete, View tasks

📊 Dashboard Analytics – Task stats by status, priority, due date trends

🔒 Protected Routes – Only authorized users can access specific pages

🖼️ Responsive UI – Mobile-friendly with Tailwind CSS

⚙️ Installation & Setup (For Local Development)

Clone repos

git clone https://github.com/LavanyaCS/todo-frontend.git
git clone https://github.com/LavanyaCS/todo-backend.git


Backend Setup

cd todo-backend
npm install


Create a .env file:

PORT=8080
DBURL=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
JWT_EXPIRES_IN=24h


Run backend:

npm start


Frontend Setup

cd todo-frontend
npm install


Update baseUrl in src/api.js to your backend URL.
Run frontend:

npm start

🔒 Role-Based Access

Admin: Can view dashboard with task analytics + manage all tasks.

User: Can only manage their own tasks (CRUD).

Unauthorized users trying to access restricted pages will see an "Access Denied" message.

📂 Project Structure
Frontend
src/
 ├── components/
 ├── pages/
 ├── api.js
 ├── App.js
 └── index.js

Backend
src/
 ├── models/
 ├── routes/
 ├── controllers/
 ├── middleware/
 └── server.js