<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch($method) {
    case 'POST':
        if ($action === 'signup') {
            signup();
        } elseif ($action === 'signin') {
            signin();
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function signup() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, email and password are required']);
        return;
    }
    
    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'User already exists']);
            return;
        }
        
        // Hash password
        $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, bio, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['name'],
            $input['email'],
            $hashedPassword,
            'user', // Default role for new registrations
            $input['profile']['bio'] ?? '',
            $input['profile']['phone'] ?? '',
            $input['profile']['address'] ?? ''
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Return user data (without password)
        $stmt = $pdo->prepare("SELECT id, name, email, role, bio, phone, address, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Format response to match frontend expectations
        $response = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'profile' => [
                'bio' => $user['bio'],
                'phone' => $user['phone'],
                'address' => $user['address']
            ],
            'createdAt' => $user['created_at']
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

function signin() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }
    
    try {
        // Find user by email
        $stmt = $pdo->prepare("SELECT id, name, email, password, role, bio, phone, address, created_at FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($input['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }
        
        // Format response to match frontend expectations
        $response = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'profile' => [
                'bio' => $user['bio'],
                'phone' => $user['phone'],
                'address' => $user['address']
            ],
            'createdAt' => $user['created_at']
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}
?>
