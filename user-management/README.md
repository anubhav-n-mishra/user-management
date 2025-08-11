# User Management System

Full-stack user management application with role-based access control.

## Tech Stack

- **Frontend**: React 19 + Vite + React Router v7
- **Backend**: Node.js + Express + MySQL
- **Database**: MySQL 8.0+
- **Authentication**: Custom headers (X-User-Id, X-User-Role)

## Features

- User signup/signin
- Role-based access (admin/user)
- Admin can manage all users (CRUD)
- Users can only edit their own profile
- Secure data isolation per user
- Real-time form validation

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/anubhav-n-mishra/user-management.git
cd user-management

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

Create MySQL database:
```sql
CREATE DATABASE user_management;
```

Copy environment file:
```bash
cd server
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=user_management
PORT=3001
```

Run migration (creates tables + admin user):
```bash
npm run api:migrate
```

### 3. Start Development Servers

Terminal 1 - Backend API:
```bash
npm run api:dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Access: http://localhost:5173

### 4. Login

**Admin Account:**
- Email: admin@example.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### User Management
- `GET /api/users` - List users (admin: all, user: self only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Headers Required
All user endpoints require:
```
X-User-Id: {user_id}
X-User-Role: {admin|user}
```

## Project Structure

```
user-management/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── context/           # Auth context
│   ├── services/          # API service
│   └── App.jsx            # Main app
├── server/                # Express backend
│   ├── src/
│   │   ├── auth.js        # Auth routes
│   │   ├── users.js       # User CRUD routes
│   │   ├── db.js          # Database connection
│   │   └── server.js      # Express app
│   ├── scripts/
│   │   └── migrate.js     # Database migration
│   └── package.json       # Backend dependencies
└── package.json           # Frontend dependencies
```

## Role System

- **Admin**: Can view/create/edit/delete all users, assign roles
- **User**: Can only view/edit their own profile

## Security

- Passwords hashed with bcrypt
- Role-based access control on all endpoints
- Email uniqueness validation
- Admin cannot delete themselves
- Admin cannot remove their own admin role

## Development

### Add New User (Admin)
1. Login as admin
2. Go to User Management
3. Click "Add New User"
4. Fill form and select role
5. Default password: "user123"

### Scripts
- `npm run dev` - Start frontend dev server
- `npm run api:dev` - Start backend dev server  
- `npm run api:migrate` - Run database migration
- `npm run build` - Build frontend for production

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License
