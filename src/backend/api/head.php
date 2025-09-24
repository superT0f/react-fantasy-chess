<?php
// Improved CORS handling for session persistence
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://fantasy-chess.prigent.site',
    'https://fantasy-chess.prigent.site/play'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Default to request origin or localhost
    header('Access-Control-Allow-Origin: http://localhost:3000');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Expose-Headers: Set-Cookie');

// Dynamic domain detection
$is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
    || $_SERVER['SERVER_PORT'] == 443;
$is_localhost = strpos($_SERVER['HTTP_HOST'], 'localhost') !== false;

if ($is_localhost) {
    // For local development - less restrictive settings
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.cookie_secure', false);
    $domain = false; // Don't set domain for localhost
} else {
    // For production
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', true);
    $domain = '.prigent.site'; // Note the leading dot for subdomains
}

ini_set('session.use_strict_mode', true);
ini_set('session.cookie_httponly', true);
ini_set('session.cookie_lifetime', 86400); // 24 hours

// Enhanced session configuration
session_set_cookie_params([
    'lifetime' => 86400, // 24 hours
    'path' => '/',
    'domain' => $domain,
    'secure' => $is_https && !$is_localhost,
    'httponly' => true,
    'samesite' => $is_localhost ? 'Lax' : 'None'
]);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Start session only if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Regenerate session ID to prevent fixation attacks
if (empty($_SESSION['created'])) {
    session_regenerate_id(true);
    $_SESSION['created'] = time();
} elseif (time() - $_SESSION['created'] > 1800) {
    // Regenerate every 30 minutes
    session_regenerate_id(true);
    $_SESSION['created'] = time();
}

// Start session only if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Load environment variables from .env file
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        $value = trim($value, '"\'');

        putenv("$name=$value");
    }
}

$servername = getenv('DB_HOST') ?: 'localhost';
$username = getenv('DB_USER') ?: 'tof';
$password = getenv('DB_PASS') ?: 'tof';
$dbname = getenv('DB_NAME') ?: 'fc';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Session validation functions
function get_user_id()
{
    return $_SESSION['user_id'] ?? null;
}

function require_auth()
{
    //die(print_r($_SESSION,1));
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["error" => "Authentication required"]);
        exit();
    }
    return $_SESSION['user_id'];
}

// Add CSRF protection helper
function generate_csrf_token()
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token)
{
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function get_user_by_username($conn, $username): mixed
{
    $stmt = $conn->prepare("SELECT id, username, password_hash, email, created_at FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = false;
    if ($result->num_rows === 1)
        $user = $result->fetch_assoc();

    return $user;
}

function exist_user_by_username_or_email($conn, $username, $email): mixed
{
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);

    $stmt->execute();
    $result = $stmt->get_result();

    return ($result->num_rows > 0);
}

function insert_user($conn, $user){
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $user['username'], $user['email'], $user['password']);
    $user_id = false;
    if ($stmt->execute())
        $user_id = $stmt->insert_id;
    
    return $user_id;
}
