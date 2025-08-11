-- Add role column to users table
ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user' AFTER password;

-- Create an admin user (you can use this account to manage other users)
INSERT INTO users (name, email, password, role, bio, phone, address) VALUES 
('Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator', '+91 98765 43210', 'Admin Office, India');

-- Update existing users to have 'user' role by default
UPDATE users SET role = 'user' WHERE role IS NULL;
