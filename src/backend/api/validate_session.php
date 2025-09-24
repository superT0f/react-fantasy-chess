<?php
require 'head.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['user_id']) && $_SESSION['logged_in']) {
        $user_id = $_SESSION['user_id'];
        
        $stmt = $conn->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            echo json_encode([
                "valid" => true,
                "user" => $user,
                "session_id" => session_id()
            ]);
        } else {
            // User no longer exists in database
            session_destroy();
            echo json_encode(["valid" => false, "error" => "User not found"]);
        }
    } else {
        echo json_encode(["valid" => false, "error" => "No active session"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>