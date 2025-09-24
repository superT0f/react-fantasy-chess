<?php
require 'head.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Username and password are required"]);
        exit();
    }
    
    $username = $conn->real_escape_string($input['username']);
    $password = $input['password'];
    $user = get_user_by_username($conn, $username);
    
    if ($user) {
        
        if (password_verify($password, $user['password_hash'])) {
            // Regenerate session ID for security
            session_regenerate_id(true);
            
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['logged_in'] = true;
            $_SESSION['login_time'] = time();
            
            // Generate CSRF token
            $csrf_token = generate_csrf_token();
            
            // Remove password hash from response
            unset($user['password_hash']);
            
            echo json_encode([
                "success" => true,
                "user" => $user,
                "csrf_token" => $csrf_token,
                "session_id" => session_id(),
                "message" => "Login successful"
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>