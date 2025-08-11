# User Management API

## Setup Instructions

1. **Copy Backend Files to XAMPP:**
   ```
   Copy the entire 'backend' folder to: C:\xampp\htdocs\user-management-api\
   ```

2. **Create Database in phpMyAdmin:**
   - Open http://localhost/phpmyadmin
   - Create database: `user_management`
   - Run this SQL:
   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       bio TEXT,
       phone VARCHAR(20),
       address TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       created_by VARCHAR(255),
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

## API Endpoints

- **Authentication:**
  - POST `/auth.php/signup` - User registration
  - POST `/auth.php/signin` - User login

- **User Management:**
  - GET `/users.php` - Get all users
  - GET `/users.php/{id}` - Get specific user
  - POST `/users.php` - Create new user
  - PUT `/users.php/{id}` - Update user
  - DELETE `/users.php/{id}` - Delete user

## Test URLs
- http://localhost/user-management-api/auth.php
- http://localhost/user-management-api/users.php
