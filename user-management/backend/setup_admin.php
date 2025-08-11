<?php
require_once 'config.php';

try {
    // Add role column if it doesn't exist
    $pdo->exec("ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user' AFTER password");
    echo "✅ Role column added successfully\n";
} catch (Exception $e) {
    echo "ℹ️ Role column might already exist: " . $e->getMessage() . "\n";
}

try {
    // Create admin user
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
    
    echo "✅ Admin user created successfully\n";
    echo "📧 Email: admin@example.com\n";
    echo "🔑 Password: admin123\n";
} catch (Exception $e) {
    echo "❌ Error creating admin user: " . $e->getMessage() . "\n";
}

// Update existing users to have 'user' role
try {
    $pdo->exec("UPDATE users SET role = 'user' WHERE role IS NULL");
    echo "✅ Updated existing users to 'user' role\n";
} catch (Exception $e) {
    echo "❌ Error updating existing users: " . $e->getMessage() . "\n";
}

echo "\n🎉 Setup complete!\n";
?>
