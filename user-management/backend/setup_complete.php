<?php
// Simple database check and setup
$host = 'localhost';
$dbname = 'user_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Database connection successful<br>";
    
    // Check if role column exists
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('role', $columns)) {
        echo "⚠️ Role column missing. Adding it...<br>";
        $pdo->exec("ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user' AFTER password");
        echo "✅ Role column added<br>";
    } else {
        echo "✅ Role column already exists<br>";
    }
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['admin@example.com']);
    
    if (!$stmt->fetch()) {
        echo "⚠️ Admin user missing. Creating it...<br>";
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, bio, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            'Admin User',
            'admin@example.com', 
            $hashedPassword,
            'admin',
            'System Administrator',
            '+91 98765 43210',
            'Admin Office, India'
        ]);
        echo "✅ Admin user created (admin@example.com / admin123)<br>";
    } else {
        echo "✅ Admin user already exists<br>";
    }
    
    // Update existing users to have 'user' role if null
    $pdo->exec("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''");
    echo "✅ Updated existing users to 'user' role<br>";
    
    // Show current users
    echo "<h3>Current Users:</h3>";
    $stmt = $pdo->query("SELECT id, name, email, role FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
    foreach ($users as $user) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($user['id']) . "</td>";
        echo "<td>" . htmlspecialchars($user['name']) . "</td>";
        echo "<td>" . htmlspecialchars($user['email']) . "</td>";
        echo "<td>" . htmlspecialchars($user['role']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<br><h2>🎉 Setup Complete!</h2>";
    echo "<p>You can now use:</p>";
    echo "<ul>";
    echo "<li><strong>Admin Login:</strong> admin@example.com / admin123</li>";
    echo "<li><strong>Your App:</strong> <a href='http://localhost:5173'>http://localhost:5173</a></li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
    
    if (strpos($e->getMessage(), "doesn't exist") !== false) {
        echo "<h3>Database doesn't exist. Please create it first:</h3>";
        echo "<ol>";
        echo "<li>Go to <a href='http://localhost/phpmyadmin'>phpMyAdmin</a></li>";
        echo "<li>Click 'New' to create a database</li>";
        echo "<li>Name it: <code>user_management</code></li>";
        echo "<li>Click 'Create'</li>";
        echo "<li>Select the database and go to 'SQL' tab</li>";
        echo "<li>Run this SQL:</li>";
        echo "</ol>";
        echo "<textarea rows='10' cols='80'>";
        echo "CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    bio TEXT,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);";
        echo "</textarea>";
    }
}
?>
