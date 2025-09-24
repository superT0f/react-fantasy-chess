<?php
require 'head.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $required = ['username', 'email', 'password'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required field: $field"]);
            exit();
        }
    }

    $username = $conn->real_escape_string($input['username']);
    $email = $conn->real_escape_string($input['email']);
    $password = password_hash($input['password'], PASSWORD_DEFAULT);

    // Check if username or email already exists   
    if (exist_user_by_username_or_email($conn, $username, $email)) {
        http_response_code(409);
        echo json_encode(["error" => "Username or email already exists"]);
        exit();
    }

    // Insert new user
    $user = [
        'username' => $username,
        'email' => $email,
        'password' => $password
    ];

    $user_id = insert_user($conn, $user);
    if ($user_id) {
        // Auto-login after registration
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user_id;
        $_SESSION['user'] = $user;
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();

        $csrf_token = generate_csrf_token();

        // Get the created user
        $userStmt = $conn->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
        $userStmt->bind_param("i", $user_id);
        $userStmt->execute();
        $userResult = $userStmt->get_result();
        $user = $userResult->fetch_assoc();

        echo json_encode([
            "success" => true,
            "user" => $user,
            "csrf_token" => $csrf_token,
            "session_id" => session_id(),
            "message" => "Registration successful"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Registration failed: " . $stmt->error]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>