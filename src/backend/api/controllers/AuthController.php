<?php

class AuthController
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function login($conn)
    {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['username']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(["error" => "Username and password are required"]);
            exit();
        }

        $username = $conn->real_escape_string($input['username']);
        $password = $input['password'];
        $remember_me = isset($input['remember_me']) && $input['remember_me'] === true;
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

                // Generate remember me token if requested
                $remember_token = null;
                if ($remember_me) {
                    $remember_token = bin2hex(random_bytes(32));
                    $expires = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)); // 30 days

                    // Store remember token in database
                    $stmt = $conn->prepare("INSERT INTO remember_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
                    $stmt->bind_param("iss", $user['id'], $remember_token, $expires);
                    $stmt->execute();

                    // Set remember me cookie
                    setcookie('remember_me', $remember_token, [
                        'expires' => time() + (30 * 24 * 60 * 60),
                        'path' => '/',
                        'domain' => '',
                        'secure' => isset($_SERVER['HTTPS']),
                        'httponly' => true,
                        'samesite' => 'Lax'
                    ]);
                }

                // Remove password hash from response
                unset($user['password_hash']);

                echo json_encode([
                    "success" => true,
                    "user" => $user,
                    "csrf_token" => $csrf_token,
                    "session_id" => session_id(),
                    "remember_token" => $remember_token,
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
    }


    public function register()
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $required = ['username', 'email', 'password'];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                http_response_code(400);
                echo json_encode(["error" => "Missing required field: $field"]);
                return;
            }
        }

        $username = $this->conn->real_escape_string($input['username']);
        $email = $this->conn->real_escape_string($input['email']);
        $password = password_hash($input['password'], PASSWORD_DEFAULT);

        if (exist_user_by_username_or_email($this->conn, $username, $email)) {
            http_response_code(409);
            echo json_encode(["error" => "Username or email already exists"]);
            return;
        }

        $user = [
            'username' => $username,
            'email' => $email,
            'password' => $password
        ];

        $user_id = insert_user($this->conn, $user);
        if ($user_id) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user_id;
            $_SESSION['user'] = $user;
            $_SESSION['logged_in'] = true;
            $_SESSION['login_time'] = time();

            $csrf_token = generate_csrf_token();

            $userStmt = $this->conn->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
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
            echo json_encode(["error" => "Registration failed"]);
        }
    }

    public function validateSession()
    {
        if (isset($_SESSION['user_id']) && $_SESSION['logged_in']) {
            $user_id = $_SESSION['user_id'];

            $stmt = $this->conn->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
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
                session_destroy();
                echo json_encode(["valid" => false, "error" => "User not found"]);
            }
        } else {
            echo json_encode(["valid" => false, "error" => "No active session"]);
        }
    }

    public function logout($conn)
    {

        // Clear remember me token if exists
        if (isset($_COOKIE['remember_me'])) {
            $remember_token = $_COOKIE['remember_me'];

            // Delete token from database
            $stmt = $conn->prepare("DELETE FROM remember_tokens WHERE token = ?");
            $stmt->bind_param("s", $remember_token);
            $stmt->execute();

            // Clear cookie
            setcookie('remember_me', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'domain' => '',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        }

        // Destroy session
        session_destroy();

        echo json_encode(["success" => true, "message" => "Logged out successfully"]);
    }
}
