<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? null;

// Get current user from header
$currentUserId = $_SERVER['HTTP_X_USER_ID'] ?? null;
$currentUserRole = $_SERVER['HTTP_X_USER_ROLE'] ?? null;

if (!$currentUserId) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit();
}

switch($method) {
    case 'GET':
        if ($id) {
            getUser($id, $currentUserId, $currentUserRole);
        } else {
            getAllUsers($currentUserId, $currentUserRole);
        }
        break;
    case 'POST':
        createUser($currentUserId, $currentUserRole);
        break;
    case 'PUT':
        if ($id) {
            updateUser($id, $currentUserId, $currentUserRole);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required for update']);
        }
        break;
    case 'DELETE':
        if ($id) {
            deleteUser($id, $currentUserId, $currentUserRole);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required for delete']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getAllUsers($currentUserId, $currentUserRole) {
    global $pdo;
    
    try {
        // Only admins can see all users; regular users can only see themselves
        if ($currentUserRole === 'admin') {
            $stmt = $pdo->query("SELECT id, name, email, role, bio, phone, address, created_at, created_by FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $stmt = $pdo->prepare("SELECT id, name, email, role, bio, phone, address, created_at FROM users WHERE id = ?");
            $stmt->execute([$currentUserId]);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        // Format response to match frontend expectations
        $response = array_map(function($user) {
            return [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'profile' => [
                    'bio' => $user['bio'],
                    'phone' => $user['phone'],
                    'address' => $user['address']
                ],
                'createdAt' => $user['created_at'],
                'createdBy' => $user['created_by'] ?? null
            ];
        }, $users);
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

function getUser($id, $currentUserId, $currentUserRole) {
    global $pdo;
    
    // Users can only see their own data unless they're admin
    if ($currentUserRole !== 'admin' && $id != $currentUserId) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT id, name, email, role, bio, phone, address, created_at, created_by FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
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
            'createdAt' => $user['created_at'],
            'createdBy' => $user['created_by'] ?? null
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

function createUser($currentUserId, $currentUserRole) {
    global $pdo;
    
    // Only admins can create new users
    if ($currentUserRole !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Only administrators can create users']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['name']) || !isset($input['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and email are required']);
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
        
        // Set default password
        $hashedPassword = password_hash('user123', PASSWORD_DEFAULT);
        // Determine role (admins may set role, default user otherwise)
        $newRole = 'user';
        if ($currentUserRole === 'admin' && isset($input['role']) && in_array($input['role'], ['admin','user'])) {
            $newRole = $input['role'];
        }

        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, bio, phone, address, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['name'],
            $input['email'],
            $hashedPassword,
            $newRole,
            $input['profile']['bio'] ?? '',
            $input['profile']['phone'] ?? '',
            $input['profile']['address'] ?? '',
            $input['createdBy'] ?? null
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Return user data
        $stmt = $pdo->prepare("SELECT id, name, email, role, bio, phone, address, created_at, created_by FROM users WHERE id = ?");
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
            'createdAt' => $user['created_at'],
            'createdBy' => $user['created_by']
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

function updateUser($id, $currentUserId, $currentUserRole) {
    global $pdo;
    
    // Users can only update their own data unless they're admin
    if ($currentUserRole !== 'admin' && $id != $currentUserId) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        // Build update parts
        $fields = ['name = ?', 'email = ?', 'bio = ?', 'phone = ?', 'address = ?'];
        $params = [
            $input['name'],
            $input['email'],
            $input['profile']['bio'] ?? '',
            $input['profile']['phone'] ?? '',
            $input['profile']['address'] ?? ''
        ];

        // Admin may change role (cannot demote themselves)
        if ($currentUserRole === 'admin' && isset($input['role']) && in_array($input['role'], ['admin','user'])) {
            if ($id == $currentUserId && $input['role'] !== 'admin') {
                http_response_code(400);
                echo json_encode(['error' => 'You cannot remove your own admin role']);
                return;
            }
            $fields[] = 'role = ?';
            $params[] = $input['role'];
        }

        $params[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        // Return updated user data
        $stmt = $pdo->prepare("SELECT id, name, email, role, bio, phone, address, created_at, created_by FROM users WHERE id = ?");
        $stmt->execute([$id]);
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
            'createdAt' => $user['created_at'],
            'createdBy' => $user['created_by'] ?? null
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}

function deleteUser($id, $currentUserId, $currentUserRole) {
    global $pdo;
    
    // Only admins can delete users, and they can't delete themselves
    if ($currentUserRole !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Only administrators can delete users']);
        return;
    }
    
    if ($id == $currentUserId) {
        http_response_code(403);
        echo json_encode(['error' => 'You cannot delete your own account']);
        return;
    }
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        // Delete user
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'User deleted successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
}
?>
